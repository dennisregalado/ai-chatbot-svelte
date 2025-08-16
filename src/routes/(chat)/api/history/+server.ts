import { getChatsByUserId } from '$server/db/queries';
import { ChatSDKError } from '$lib/errors';
import { json } from '@sveltejs/kit';

export async function GET({ request, locals: { session } }) {
	const { searchParams } = new URL(request.url);

	const limit = Number.parseInt(searchParams.get('limit') || '10');
	const startingAfter = searchParams.get('starting_after');
	const endingBefore = searchParams.get('ending_before');

	if (startingAfter && endingBefore) {
		return new ChatSDKError(
			'bad_request:api',
			'Only one of starting_after or ending_before can be provided.'
		).toResponse();
	}

	if (!session?.userId) {
		return new ChatSDKError('unauthorized:chat').toResponse();
	}

	const chats = await getChatsByUserId({
		id: session.userId,
		limit,
		startingAfter,
		endingBefore
	});

	return json(chats);
}
