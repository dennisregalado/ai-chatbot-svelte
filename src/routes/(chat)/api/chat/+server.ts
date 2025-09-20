import {
	convertToModelMessages,
	createUIMessageStream,
	JsonToSseTransformStream,
	smoothStream,
	stepCountIs,
	streamText,
	streamObject
} from 'ai';
import { z } from 'zod';
import { type RequestHints, systemPrompt } from '$ai/prompts';
import {
	createStreamId,
	getChatById,
	getMessageCountByUserId,
	getMessagesByChatId,
	saveChat,
	saveMessages
} from '$server/db/queries';
import { convertToUIMessages, getTextFromMessage, generateUUID } from '$lib/utils';
import { generateTitleFromUserMessage } from '$remote/chat.remote.js';
import { createDocument } from '$ai/tools/create-document';
import { updateDocument } from '$ai/tools/update-document';
import { requestSuggestions } from '$ai/tools/request-suggestions';
import { getWeather } from '$ai/tools/get-weather';
import { myProvider } from '$ai/providers';
import { entitlementsByUserType } from '$ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import { ChatSDKError } from '$lib/errors';
import type { ChatMessage } from '$lib/types';
import type { ChatModel } from '$ai/models';
import type { VisibilityType } from '$components/visibility-selector.svelte';
import { dev } from '$app/environment';

export const config = {
	maxDuration: 60
};

export const POST = async ({ request, locals: { session, getStreamContext } }) => {
	let requestBody: PostRequestBody;

	try {
		const json = await request.json();

		requestBody = postRequestBodySchema.parse(json);
	} catch (error) {
		console.error('Error parsing request body:', error);
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

		let streamedTitle: string;

		if (!chat) {
			const messageText = getTextFromMessage(message);
			const title = await generateTitleFromUserMessage({
				message: messageText
			});

			await saveChat({
				id,
				userId: session.userId,
				title,
				visibility: selectedVisibilityType
			});

			// Make the generated title available for the UI stream
			streamedTitle = title;
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
				// Stream the chat title early so the UI can update sidebar immediately
				if (streamedTitle) {
					dataStream.write({ type: 'data-title', data: streamedTitle, transient: true });
				}

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
						sendReasoning: true,
						sendSources: true
					})
				);

				// Clear previous follow-ups in the UI and start streaming new ones
				try {
					dataStream.write({ type: 'data-clear', data: null, transient: true });

					// Build a compact transcript for suggestion generation
					const transcript = uiMessages
						.map((m) => {
							const prefix =
								m.role === 'user' ? 'User' : m.role === 'assistant' ? 'Assistant' : 'System';
							const text = getTextFromMessage(m);
							return `${prefix}: ${text}`;
						})
						.join('\n');

					// Stream 3–5 concise follow-up questions as an array of strings
					(async () => {
						const { elementStream } = streamObject({
							model: myProvider.languageModel('title-model'),
							system:
								'Given the conversation transcript, generate 3 to 5 concise, diverse follow-up questions the user might ask next. Keep each under 12 words and avoid repeating the same topic. Output only an array of strings with no additional commentary.',
							prompt: transcript,
							output: 'array',
							schema: z.string()
						});

						for await (const question of elementStream) {
							// Stream each follow-up to the UI as it arrives
							dataStream.write({ type: 'data-followup', data: question, transient: true });
						}
					})().catch((err) => {
						console.error('followup streaming error', err);
					});
				} catch (err) {
					console.error('failed to start followup suggestions', err);
				}
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

		const streamContext = await getStreamContext();

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
		console.error('Error in chat API:', error);
		if (error instanceof ChatSDKError) {
			return error.toResponse();
		}
		// Handle any other unexpected errors
		console.error('Unexpected error in chat API:', error);
		return new ChatSDKError('bad_request:api').toResponse();
	}
};
