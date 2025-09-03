import { command, getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import * as db from '$server/db/queries';
import { generateText } from 'ai';
import type { VisibilityType } from '$components/visibility-selector.svelte';
import { myProvider } from '$ai/providers';
import { error, redirect } from '@sveltejs/kit';

export const getChatHistory = query(async () => {
	const {
		locals: { session }
	} = getRequestEvent();

	if (!session?.userId) {
		error(401, 'Unauthorized');
	}

	const chats = await db.getChatsByUserId({
		id: session.userId
	});

	return chats;
});

export const getChatById = query(z.string(), async (id) => {
	const {
		locals: { session }
	} = getRequestEvent();
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

export const getMessagesByChatId = query(z.string(), async (id) => {
	const messages = await db.getMessagesByChatId({ id });
	return messages;
});

export const deleteChatById = command(z.string(), async (id) => {
	const {
		locals: { session }
	} = getRequestEvent();

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

export const getVotesByChatId = query(z.string(), async (chatId) => {
	const {
		locals: { session }
	} = getRequestEvent();

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

export const updateVoteByChatId = command(
	z.object({
		chatId: z.string(),
		messageId: z.string(),
		type: z.enum(['up', 'down'])
	}),
	async ({ chatId, messageId, type }) => {
		const {
			locals: { session }
		} = getRequestEvent();

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
			type
		});
	}
);

export const generateTitleFromUserMessage = query(
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
	async ({ id }) => {
		const [message] = await db.getMessageById({ id });

		await db.deleteMessagesByChatIdAfterTimestamp({
			chatId: message.chatId,
			timestamp: message.createdAt
		});
	}
);

export const getChatVisibility = query(z.string(), async (id: string) => {
	const { cookies } = getRequestEvent();

	const chat = await db.getChatById({ id });

	return chat?.visibility || cookies.get('chat-visibility') || 'private';
});

export const updateChatVisibility = command(
	z.object({
		chatId: z.string(),
		visibility: z.enum(['public', 'private'])
	}),
	async ({ chatId, visibility }) => {
		const { cookies } = getRequestEvent();

		const result = await db.updateChatVisiblityById({ chatId, visibility });

		if (result.length === 0) {
			cookies.set('chat-visibility', visibility, {
				path: '/'
			});
		}
	}
);

export const updateChatIsFavorite = command(
	z.object({
		chatId: z.string(),
		isFavorite: z.boolean()
	}),
	async ({ chatId, isFavorite }) => {
		const {
			locals: { session }
		} = getRequestEvent();

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

		await db.updateChatIsFavoriteById({ chatId, isFavorite });
	}
);

export const updateChatTitle = command(
	z.object({
		chatId: z.string(),
		title: z.string()
	}),
	async ({ chatId, title }) => {
		const {
			locals: { session }
		} = getRequestEvent();

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

		await db.updateChatTitleById({
			chatId,
			title
		});
	}
);

export const getSuggestionsByDocumentId = query(
	z.object({
		documentId: z.string()
	}),
	async ({ documentId }) => {
		const {
			locals: { session }
		} = getRequestEvent();

		if (!session?.userId) {
			error(401, 'Unauthorized');
		}

		const suggestions = await db.getSuggestionsByDocumentId({
			documentId
		});

		const [suggestion] = suggestions;

		if (!suggestion) {
			return [];
		}

		if (suggestion.userId !== session.userId) {
			error(403, 'Forbidden');
		}

		return suggestions;
	}
);
