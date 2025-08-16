import { command, query } from '$app/server';
import { z } from 'zod';
import * as db from '$server/db/queries';
import type { VisibilityType } from '$components/visibility-selector.svelte';

export const getUser = query(z.string(), async (email: string) => {
	return db.getUser(email);
});

export const createUser = command(
	z.object({
		email: z.string(),
		password: z.string()
	}),
	async ({ email, password }: { email: string; password: string }) => {
		return db.createUser(email, password);
	}
);

export const createGuestUser = command(async () => {
	return db.createGuestUser();
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

export const deleteChatById = command(z.string(), async (id: string) => {
	return db.deleteChatById({ id });
});

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

export const getChatById = query(z.string(), async (id: string) => {
	return db.getChatById({ id });
});

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

export const getVotesByChatId = query(z.string(), async (id: string) => {
	return db.getVotesByChatId({ id });
});

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
