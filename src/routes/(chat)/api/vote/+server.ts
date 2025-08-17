import { getChatById, getVotesByChatId, voteMessage } from '$server/db/queries';
import { ChatSDKError } from '$lib/errors';
import { json } from '@sveltejs/kit';

export async function GET({ request, locals: { session } }) {
	const { searchParams } = new URL(request.url);
	const chatId = searchParams.get('chatId');

	if (!chatId) {
		return new ChatSDKError('bad_request:api', 'Parameter chatId is required.').toResponse();
	}

	if (!session?.userId) {
		return new ChatSDKError('unauthorized:vote').toResponse();
	}

	const chat = await getChatById({ id: chatId });

	if (!chat) {
		return new ChatSDKError('not_found:chat').toResponse();
	}

	if (chat.userId !== session.userId) {
		return new ChatSDKError('forbidden:vote').toResponse();
	}

	const votes = await getVotesByChatId({ id: chatId });

	return json(votes);
}

export async function PATCH({ request, locals: { session } }) {
	const { chatId, messageId, type }: { chatId: string; messageId: string; type: 'up' | 'down' } =
		await request.json();

	if (!chatId || !messageId || !type) {
		return new ChatSDKError(
			'bad_request:api',
			'Parameters chatId, messageId, and type are required.'
		).toResponse();
	}

	if (!session?.userId) {
		return new ChatSDKError('unauthorized:vote').toResponse();
	}

	const chat = await getChatById({ id: chatId });

	if (!chat) {
		return new ChatSDKError('not_found:vote').toResponse();
	}

	if (chat.userId !== session.userId) {
		return new ChatSDKError('forbidden:vote').toResponse();
	}

	await voteMessage({
		chatId,
		messageId,
		type: type
	});

	return json('Message voted');
}
