import {
	convertToModelMessages,
	createUIMessageStream,
	JsonToSseTransformStream,
	smoothStream,
	stepCountIs,
	streamText
} from 'ai';
import { type RequestHints, systemPrompt } from '$ai/prompts';
import {
	createStreamId,
	deleteChatById,
	getChatById,
	getMessageCountByUserId,
	getMessagesByChatId,
	saveChat,
	saveMessages
} from '$server/db/queries';
import { convertToUIMessages, generateUUID } from '$lib/utils';
import { generateTitleFromUserMessage } from '$remote/chat.remote';
import { createDocument } from '$ai/tools/create-document';
import { updateDocument } from '$ai/tools/update-document';
import { requestSuggestions } from '$ai/tools/request-suggestions';
import { getWeather } from '$ai/tools/get-weather';
import { myProvider } from '$ai/providers';
import { entitlementsByUserType } from '$ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import { json } from '@sveltejs/kit';
import { ChatSDKError } from '$lib/errors';
import type { ChatMessage } from '$lib/types';
import type { ChatModel } from '$ai/models';
import type { VisibilityType } from '$components/visibility-selector.svelte';
import { dev } from '$app/environment';

// const maxDuration = 60;

export const POST = async ({ request, locals: { session, getStreamContext } }) => {
	let requestBody: PostRequestBody;

	try {
		const json = await request.json();
		requestBody = postRequestBodySchema.parse(json);
	} catch (_) {
		return new ChatSDKError('bad_request:api').toResponse();
	}

	try {
		const {
			id,
			message,
			selectedChatModel,
			selectedVisibilityType
		}: {
			id: string;
			message: ChatMessage;
			selectedChatModel: ChatModel['id'];
			selectedVisibilityType: VisibilityType;
		} = requestBody;

		if (!session?.userId) {
			return new ChatSDKError('unauthorized:chat').toResponse();
		}

		// Determine user type based on Better Auth session
		// For now, assume all users are regular until we can determine anonymous status
		const userType = 'regular';

		const messageCount = await getMessageCountByUserId({
			id: session.userId,
			differenceInHours: 24
		});

		if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
			return new ChatSDKError('rate_limit:chat').toResponse();
		}

		const chat = await getChatById({ id });

		if (!chat) {
			const title = await generateTitleFromUserMessage({
				// @ts-ignore
				message
			});

			await saveChat({
				id,
				userId: session.userId,
				title,
				visibility: selectedVisibilityType
			});
		} else {
			if (chat.userId !== session.userId) {
				return new ChatSDKError('forbidden:chat').toResponse();
			}
		}

		const messagesFromDb = await getMessagesByChatId({ id });
		const uiMessages = [...convertToUIMessages(messagesFromDb), message];

		const { longitude, latitude, city, country } = geolocation(request);

		const requestHints: RequestHints = {
			longitude,
			latitude,
			city,
			country
		};

		await saveMessages({
			messages: [
				{
					chatId: id,
					id: message.id,
					role: 'user',
					parts: message.parts,
					attachments: [],
					createdAt: new Date()
				}
			]
		});

		const streamId = generateUUID();
		await createStreamId({ streamId, chatId: id });

		const stream = createUIMessageStream({
			execute: ({ writer: dataStream }) => {
				const result = streamText({
					model: myProvider.languageModel(selectedChatModel),
					system: systemPrompt({ selectedChatModel, requestHints }),
					messages: convertToModelMessages(uiMessages),
					stopWhen: stepCountIs(5),
					experimental_activeTools:
						selectedChatModel === 'chat-model-reasoning'
							? []
							: ['getWeather', 'createDocument', 'updateDocument', 'requestSuggestions'],
					experimental_transform: smoothStream({ chunking: 'word' }),
					tools: {
						getWeather,
						createDocument: createDocument({ session, dataStream }),
						updateDocument: updateDocument({ session, dataStream }),
						requestSuggestions: requestSuggestions({
							session,
							dataStream
						})
					},
					experimental_telemetry: {
						isEnabled: !dev,
						functionId: 'stream-text'
					}
				});

				result.consumeStream();

				dataStream.merge(
					result.toUIMessageStream({
						sendReasoning: true
					})
				);
			},
			generateId: generateUUID,
			onFinish: async ({ messages }) => {
				await saveMessages({
					messages: messages.map((message) => ({
						id: message.id,
						role: message.role,
						parts: message.parts,
						createdAt: new Date(),
						attachments: [],
						chatId: id
					}))
				});
			},
			onError: () => {
				return 'Oops, an error occurred!';
			}
		});

		const streamContext = getStreamContext();

		if (streamContext) {
			return new Response(
				await streamContext.resumableStream(streamId, () =>
					stream.pipeThrough(new JsonToSseTransformStream())
				)
			);
		} else {
			return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
		}
	} catch (error) {
		if (error instanceof ChatSDKError) {
			return error.toResponse();
		}
	}
};

export const DELETE = async ({ request, locals: { session } }) => {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');

	if (!id) {
		return new ChatSDKError('bad_request:api').toResponse();
	}

	if (!session?.userId) {
		return new ChatSDKError('unauthorized:chat').toResponse();
	}

	const chat = await getChatById({ id });

	if (chat.userId !== session.userId) {
		return new ChatSDKError('forbidden:chat').toResponse();
	}

	const deletedChat = await deleteChatById({ id });

	return json(deletedChat);
};
