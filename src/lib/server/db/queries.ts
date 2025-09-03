import { and, asc, count, desc, eq, gt, gte, inArray, lt, type SQL } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
	user,
	chat,
	document,
	type Suggestion,
	suggestion,
	message,
	vote,
	type DBMessage,
	type Chat,
	stream
} from './schema';
import type { ArtifactKind } from '$components/artifact.svelte';
import type { VisibilityType } from '$components/visibility-selector.svelte';
import { ChatSDKError } from '$lib/errors';
import { POSTGRES_URL } from '$env/static/private';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
export const client = postgres(POSTGRES_URL);
export const db = drizzle(client);

export async function saveChat({
	id,
	userId,
	title,
	visibility
}: {
	id: string;
	userId: string;
	title: string;
	visibility: VisibilityType;
}) {
	try {
		return await db.insert(chat).values({
			id,
			createdAt: new Date(),
			userId,
			title,
			visibility
		});
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to save chat');
	}
}

export async function deleteChatById({ id }: { id: string }) {
	try {
		await db.delete(vote).where(eq(vote.chatId, id));
		await db.delete(message).where(eq(message.chatId, id));
		await db.delete(stream).where(eq(stream.chatId, id));

		const [chatsDeleted] = await db.delete(chat).where(eq(chat.id, id)).returning();
		return chatsDeleted;
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to delete chat by id');
	}
}

// todo: add pagination support
export async function getChatsByUserId({ id }: { id: string }) {
	try {
		const chats = await db
			.select()
			.from(chat)
			.where(eq(chat.userId, id))
			.orderBy(desc(chat.createdAt));
		return chats;
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get chats by user id');
	}
}

export async function getChatById({ id }: { id: string }) {
	try {
		const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
		return selectedChat;
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
	}
}

export async function saveMessages({ messages }: { messages: Array<DBMessage> }) {
	try {
		return await db.insert(message).values(messages);
	} catch (error) {
		console.error(error);
		throw new ChatSDKError('bad_request:database', 'Failed to save messages');
	}
}

export async function getMessagesByChatId({ id }: { id: string }) {
	try {
		return await db
			.select()
			.from(message)
			.where(eq(message.chatId, id))
			.orderBy(asc(message.createdAt));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get messages by chat id');
	}
}

export async function voteMessage({
	chatId,
	messageId,
	type
}: {
	chatId: string;
	messageId: string;
	type: 'up' | 'down';
}) {
	try {
		const [existingVote] = await db
			.select()
			.from(vote)
			.where(and(eq(vote.messageId, messageId)));

		if (existingVote) {
			return await db
				.update(vote)
				.set({ isUpvoted: type === 'up' })
				.where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
		}
		return await db.insert(vote).values({
			chatId,
			messageId,
			isUpvoted: type === 'up'
		});
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to vote message');
	}
}

export async function getVotesByChatId({ id }: { id: string }) {
	try {
		return await db.select().from(vote).where(eq(vote.chatId, id));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get votes by chat id');
	}
}

export async function saveDocument({
	id,
	title,
	kind,
	content,
	userId
}: {
	id: string;
	title: string;
	kind: ArtifactKind;
	content: string;
	userId: string;
}) {
	try {
		return await db
			.insert(document)
			.values({
				id,
				title,
				kind,
				content,
				userId,
				createdAt: new Date()
			})
			.returning();
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to save document');
	}
}

export async function getDocumentsById({ id }: { id: string }) {
	try {
		const documents = await db
			.select()
			.from(document)
			.where(eq(document.id, id))
			.orderBy(asc(document.createdAt));

		return documents;
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get documents by id');
	}
}

export async function getDocumentById({ id }: { id: string }) {
	try {
		const [selectedDocument] = await db
			.select()
			.from(document)
			.where(eq(document.id, id))
			.orderBy(desc(document.createdAt));

		return selectedDocument;
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get document by id');
	}
}

export async function deleteDocumentsByIdAfterTimestamp({
	id,
	timestamp
}: {
	id: string;
	timestamp: Date;
}) {
	try {
		await db
			.delete(suggestion)
			.where(and(eq(suggestion.documentId, id), gt(suggestion.documentCreatedAt, timestamp)));

		return await db
			.delete(document)
			.where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
			.returning();
	} catch (error) {
		throw new ChatSDKError(
			'bad_request:database',
			'Failed to delete documents by id after timestamp'
		);
	}
}

export async function saveSuggestions({ suggestions }: { suggestions: Array<Suggestion> }) {
	try {
		return await db.insert(suggestion).values(suggestions);
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to save suggestions');
	}
}

export async function getSuggestionsByDocumentId({ documentId }: { documentId: string }) {
	try {
		return await db
			.select()
			.from(suggestion)
			.where(and(eq(suggestion.documentId, documentId)));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get suggestions by document id');
	}
}

export async function getMessageById({ id }: { id: string }) {
	try {
		return await db.select().from(message).where(eq(message.id, id));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get message by id');
	}
}

export async function deleteMessagesByChatIdAfterTimestamp({
	chatId,
	timestamp
}: {
	chatId: string;
	timestamp: Date;
}) {
	try {
		const messagesToDelete = await db
			.select({ id: message.id })
			.from(message)
			.where(and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)));

		const messageIds = messagesToDelete.map((message) => message.id);

		if (messageIds.length > 0) {
			await db
				.delete(vote)
				.where(and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)));

			return await db
				.delete(message)
				.where(and(eq(message.chatId, chatId), inArray(message.id, messageIds)));
		}
	} catch (error) {
		throw new ChatSDKError(
			'bad_request:database',
			'Failed to delete messages by chat id after timestamp'
		);
	}
}

export async function updateChatVisiblityById({
	chatId,
	visibility
}: {
	chatId: string;
	visibility: 'private' | 'public';
}) {
	try {
		return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to update chat visibility by id');
	}
}

export async function updateChatTitleById({
	chatId,
	title,
}: {
	chatId: string;
	title: string;
}) {
	try {
		return await db
			.update(chat)
			.set({
				title,
			})
			.where(eq(chat.id, chatId));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to update chat title by id');
	}
}

export async function updateChatIsFavoriteById({
	chatId,
	isFavorite,
}: {
	chatId: string;
	isFavorite: boolean;
}) {
	try {
		return await db
			.update(chat)
			.set({
				isFavorite,
			})
			.where(eq(chat.id, chatId));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to update chat isFavorite by id');
	}
}

export async function getMessageCountByUserId({
	id,
	differenceInHours
}: {
	id: string;
	differenceInHours: number;
}) {
	try {
		const twentyFourHoursAgo = new Date(Date.now() - differenceInHours * 60 * 60 * 1000);

		const [stats] = await db
			.select({ count: count(message.id) })
			.from(message)
			.innerJoin(chat, eq(message.chatId, chat.id))
			.where(
				and(
					eq(chat.userId, id),
					gte(message.createdAt, twentyFourHoursAgo),
					eq(message.role, 'user')
				)
			)
			.execute();

		return stats?.count ?? 0;
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get message count by user id');
	}
}

export async function createStreamId({ streamId, chatId }: { streamId: string; chatId: string }) {
	try {
		await db.insert(stream).values({ id: streamId, chatId, createdAt: new Date() });
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to create stream id');
	}
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
	try {
		const streamIds = await db
			.select({ id: stream.id })
			.from(stream)
			.where(eq(stream.chatId, chatId))
			.orderBy(asc(stream.createdAt))
			.execute();

		return streamIds.map(({ id }) => id);
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get stream ids by chat id');
	}
}
