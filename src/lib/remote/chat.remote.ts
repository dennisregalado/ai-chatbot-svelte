import { command, getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import * as db from '$server/db/queries';
import { generateText } from 'ai';
import type { VisibilityType } from '$components/visibility-selector.svelte';
import { myProvider } from '$ai/providers';
import { error, redirect } from '@sveltejs/kit';

export const getChatModel = query(async () => {
	const { cookies } = getRequestEvent();
	const model = cookies.get('chat-model');
	return model;
});

export const saveChatModel = command(z.string(), async (model: string) => {
	const { cookies } = getRequestEvent();

	cookies.set('chat-model', model, {
		path: '/'
	});
});

export const getChatHistory = query(z.object({
	userId: z.string(),
	limit: z.number(),
	startingAfter: z.string().nullable(),
	endingBefore: z.string().nullable()
}), async ({ userId, limit, startingAfter, endingBefore }) => {
	const { locals: { session } } = getRequestEvent();

	if (startingAfter && endingBefore) {
		error(400, 'Only one of starting_after or ending_before can be provided.');
	}

	if (!session?.userId) {
		error(401, 'Unauthorized');
	}

	const chats = await db.getChatsByUserId({
		id: userId,
		limit,
		startingAfter,
		endingBefore
	});

	return chats;
});

export const getChatById = query(z.string(), async (id: string) => {
	const { locals: { session } } = getRequestEvent();
	const chat = await db.getChatById({ id });

	if (!chat) {
		error(404, 'Not found');
	}


	if (!session) {
		redirect(302, '/guest');
	}

	if (chat.visibility === 'private') {
		if (!session.userId) {
			error(404, 'Not found');
		}

		if (session.userId !== chat.userId) {
			error(404, 'Not found');
		}
	}

	return chat;
});

export const deleteChatById = command(z.string(), async (id: string) => {
	const { locals: { session } } = getRequestEvent();

	if (!session?.userId) {
		error(401, 'Unauthorized');
	}

	const chat = await db.getChatById({ id });

	if (chat.userId !== session.userId) {
		error(403, 'Forbidden');
	}

	const deletedChat = await db.deleteChatById({ id });

	return deletedChat;
});

export const getVotesByChatId = query(z.string(), async (chatId: string) => {
	const { locals: { session } } = getRequestEvent();

	if (!session?.userId) {
		error(401, 'Unauthorized');
	}

	const chat = await db.getChatById({ id: chatId });

	if (!chat) {
		error(404, 'Not found');
	}

	if (chat.userId !== session.userId) {
		error(403, 'Forbidden');
	}

	const votes = await db.getVotesByChatId({ id: chatId });

	return votes;
});

export const updateVoteByChatId = command(z.object({
	chatId: z.string(),
	messageId: z.string(),
	type: z.enum(['up', 'down'])
}), async ({ chatId, messageId, type }) => {

	const { locals: { session } } = getRequestEvent();

	if (!chatId || !messageId || !type) {
		error(400, 'Parameters chatId, messageId, and type are required.');
	}

	if (!session?.userId) {
		error(401, 'Unauthorized');
	}

	const chat = await db.getChatById({ id: chatId });

	if (!chat) {
		error(404, 'Not found');
	}

	if (chat.userId !== session.userId) {
		error(403, 'Forbidden');
	}

	await db.voteMessage({
		chatId,
		messageId,
		type: type
	});

	return 'Message voted';
});

export const generateTitleFromUserMessage = command(
	z.object({
		message: z.string()
	}),
	async ({ message }) => {
		const { text: title } = await generateText({
			model: myProvider.languageModel('title-model'),
			system: `\n
        - you will generate a short title based on the first message a user begins a conversation with
        - ensure it is not more than 80 characters long
        - the title should be a summary of the user's message
        - do not use quotes or colons`,
			prompt: JSON.stringify(message)
		});

		return title;
	}
);

export const deleteTrailingMessages = command(
	z.object({
		id: z.string()
	}),
	async ({ id }: { id: string }) => {
		const [message] = await db.getMessageById({ id });

		await db.deleteMessagesByChatIdAfterTimestamp({
			chatId: message.chatId,
			timestamp: message.createdAt
		});
	}
);

export const updateChatVisibility = command(
	z.object({
		chatId: z.string(),
		visibility: z.enum(['public', 'private'])
	}),
	async ({ chatId, visibility }: { chatId: string; visibility: VisibilityType }) => {
		await db.updateChatVisiblityById({ chatId, visibility });
	}
);