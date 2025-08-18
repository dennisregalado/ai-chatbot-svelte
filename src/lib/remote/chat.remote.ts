import { command, getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import * as db from '$server/db/queries';
import { generateText } from 'ai';
import type { VisibilityType } from '$components/visibility-selector.svelte';
import { myProvider } from '$ai/providers';
import { error } from '@sveltejs/kit';

// start new remote functions

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

// end new remote functions

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
		const [message] = await getMessageById(id);

		await deleteMessagesByChatIdAfterTimestamp({
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
		await updateChatVisiblityById({ chatId, visibility });
	}
);

export const getChatById = query(z.string(), async (id: string) => {
	const chat = await db.getChatById({ id });

	if (!chat) {
		error(404, 'Not found');
	}

	return chat;
});

export const saveChat = command(
	z.object({
		id: z.string(),
		userId: z.string(),
		title: z.string(),
		visibility: z.enum(['public', 'private'])
	}),
	async ({
		id,
		userId,
		title,
		visibility
	}: {
		id: string;
		userId: string;
		title: string;
		visibility: VisibilityType;
	}) => {
		return db.saveChat({ id, userId, title, visibility });
	}
);

export const getChatsByUserId = query(
	z.object({
		id: z.string(),
		limit: z.number(),
		startingAfter: z.string().nullable(),
		endingBefore: z.string().nullable()
	}),
	async ({
		id,
		limit,
		startingAfter,
		endingBefore
	}: {
		id: string;
		limit: number;
		startingAfter: string | null;
		endingBefore: string | null;
	}) => {
		return db.getChatsByUserId({ id, limit, startingAfter, endingBefore });
	}
);

export const saveMessages = command(
	z.object({
		messages: z.array(
			z.object({
				id: z.string(),
				chatId: z.string(),
				role: z.string(),
				parts: z.unknown(),
				attachments: z.unknown(),
				createdAt: z.date()
			})
		)
	}),
	async ({
		messages
	}: {
		messages: Array<{
			id: string;
			chatId: string;
			role: string;
			parts: unknown;
			attachments: unknown;
			createdAt: Date;
		}>;
	}) => {
		return db.saveMessages({ messages });
	}
);

export const getMessagesByChatId = query(z.string(), async (id: string) => {
	return db.getMessagesByChatId({ id });
});

export const voteMessage = command(
	z.object({
		chatId: z.string(),
		messageId: z.string(),
		type: z.enum(['up', 'down'])
	}),
	async ({
		chatId,
		messageId,
		type
	}: {
		chatId: string;
		messageId: string;
		type: 'up' | 'down';
	}) => {
		return db.voteMessage({ chatId, messageId, type });
	}
);



export const saveDocument = command(
	z.object({
		id: z.string(),
		title: z.string(),
		kind: z.enum(['text', 'code', 'image', 'sheet']),
		content: z.string(),
		userId: z.string()
	}),
	async ({
		id,
		title,
		kind,
		content,
		userId
	}: {
		id: string;
		title: string;
		kind: 'text' | 'code' | 'image' | 'sheet';
		content: string;
		userId: string;
	}) => {
		return db.saveDocument({ id, title, kind, content, userId });
	}
);

export const getDocumentById = query(z.string(), async (id: string) => {
	return db.getDocumentById({ id });
});

export const getDocumentsById = query(z.string(), async (id: string) => {
	return db.getDocumentsById({ id });
});

export const deleteDocumentsByIdAfterTimestamp = command(
	z.object({
		id: z.string(),
		timestamp: z.date()
	}),
	async ({ id, timestamp }: { id: string; timestamp: Date }) => {
		return db.deleteDocumentsByIdAfterTimestamp({ id, timestamp });
	}
);

export const saveSuggestions = command(
	z.object({
		suggestions: z.array(
			z.object({
				id: z.string(),
				documentId: z.string(),
				documentCreatedAt: z.date(),
				originalText: z.string(),
				suggestedText: z.string(),
				description: z.string().nullable(),
				isResolved: z.boolean(),
				userId: z.string(),
				createdAt: z.date()
			})
		)
	}),
	async ({
		suggestions
	}: {
		suggestions: Array<{
			id: string;
			documentId: string;
			documentCreatedAt: Date;
			originalText: string;
			suggestedText: string;
			description: string | null;
			isResolved: boolean;
			userId: string;
			createdAt: Date;
		}>;
	}) => {
		return db.saveSuggestions({ suggestions });
	}
);

export const getSuggestionsByDocumentId = query(z.string(), async (documentId: string) => {
	return db.getSuggestionsByDocumentId({ documentId });
});

export const getMessageById = query(z.string(), async (id: string) => {
	return db.getMessageById({ id });
});

export const deleteMessagesByChatIdAfterTimestamp = command(
	z.object({
		chatId: z.string(),
		timestamp: z.date()
	}),
	async ({ chatId, timestamp }: { chatId: string; timestamp: Date }) => {
		return db.deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp });
	}
);

export const updateChatVisiblityById = command(
	z.object({
		chatId: z.string(),
		visibility: z.enum(['private', 'public'])
	}),
	async ({ chatId, visibility }: { chatId: string; visibility: VisibilityType }) => {
		return db.updateChatVisiblityById({ chatId, visibility });
	}
);

export const getMessageCountByUserId = query(
	z.object({
		id: z.string(),
		differenceInHours: z.number()
	}),
	async ({ id, differenceInHours }: { id: string; differenceInHours: number }) => {
		return db.getMessageCountByUserId({ id, differenceInHours });
	}
);

export const createStreamId = command(
	z.object({
		streamId: z.string(),
		chatId: z.string()
	}),
	async ({ streamId, chatId }: { streamId: string; chatId: string }) => {
		return db.createStreamId({ streamId, chatId });
	}
);

export const getStreamIdsByChatId = query(z.string(), async (chatId: string) => {
	return db.getStreamIdsByChatId({ chatId });
});
