import { and, asc, count, desc, eq, gte, inArray } from 'drizzle-orm';
import {
	chat,
	message,
	vote,
	type Message
} from './schema';
import { feedback as feedbackTable } from './schema';
import type { VisibilityType } from '$components/visibility-selector.svelte';
import { ChatSDKError } from '$lib/errors';
import { getRequestEvent } from '$app/server';

function getDB() {
	return getRequestEvent().locals.db;
}

// biome-ignore lint: Forbidden non-null assertion.

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
	const db = getDB();
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
	const db = getDB();
	try {
		await db.delete(vote).where(eq(vote.chatId, id));
		await db.delete(message).where(eq(message.chatId, id));

		const [chatsDeleted] = await db.delete(chat).where(eq(chat.id, id)).returning();
		return chatsDeleted;
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to delete chat by id');
	}
}

// todo: add pagination support
export async function getChatsByUserId({ id }: { id: string }) {
	const db = getDB();
	try {
		const chats = await db
			.select()
			.from(chat)
			.where(eq(chat.userId, id))
			.orderBy(desc(chat.createdAt));
		return chats;
	} catch (error) {
		console.error(error);
		throw new ChatSDKError('bad_request:database', 'Failed to get chats by user id');
	}
}

export async function getChatById({ id }: { id: string }) {
	const db = getDB();
	try {
		const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
		return selectedChat;
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
	}
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
	const db = getDB();
	try {
		return await db.insert(message).values(messages);
	} catch (error) {
		console.error(error);
		throw new ChatSDKError('bad_request:database', 'Failed to save messages');
	}
}

export async function getMessagesByChatId({ id }: { id: string }) {
	const db = getDB();
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
	const db = getDB();
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
	const db = getDB();
	try {
		return await db.select().from(vote).where(eq(vote.chatId, id));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to get votes by chat id');
	}
}

export async function getMessageById({ id }: { id: string }) {
	const db = getDB();
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
	const db = getDB();
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
	const db = getDB();
	try {
		return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to update chat visibility by id');
	}
}

export async function updateChatTitleById({ chatId, title }: { chatId: string; title: string }) {
	const db = getDB();
	try {
		return await db
			.update(chat)
			.set({
				title
			})
			.where(eq(chat.id, chatId));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to update chat title by id');
	}
}

export async function updateChatFavoriteById({
	chatId,
	favorite
}: {
	chatId: string;
	favorite: boolean;
}) {
	const db = getDB();
	try {
		return await db
			.update(chat)
			.set({
				favorite
			})
			.where(eq(chat.id, chatId));
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to update chat favorite by id');
	}
}

export async function getMessageCountByUserId({
	id,
	differenceInHours
}: {
	id: string;
	differenceInHours: number;
}) {
	const db = getDB();
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

export async function saveFeedback({
	userId,
	message,
	sentiment
}: {
	userId: string;
	message: string | null;
	sentiment: 'sad' | 'neutral' | 'happy';
}) {
	const db = getDB();
	try {
		const [row] = await db
			.insert(feedbackTable)
			.values({
				userId,
				message: message ?? null,
				sentiment,
				createdAt: new Date()
			})
			.returning();

		return row;
	} catch (error) {
		throw new ChatSDKError('bad_request:database', 'Failed to save feedback');
	}
}
