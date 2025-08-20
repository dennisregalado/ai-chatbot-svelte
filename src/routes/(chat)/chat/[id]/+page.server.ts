import { convertToUIMessages, generateUUID } from '$lib/utils';
import { getChatById, getMessagesByChatId } from '$remote/chat.remote';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
	const { session } = locals;

	const chat = await getChatById(params.id);

	if (!chat) {
		error(404, 'Chat not found');
	}

	if (!session) {
		redirect(302, '/guest');
	}

	if (chat.visibility === 'private') {
		if (!session.userId) {
			error(404, 'Chat not found');
		}

		if (session.userId !== chat.userId) {
			error(404, 'Chat not found');
		}
	}

	const messagesFromDb = await getMessagesByChatId(params.id);

	const uiMessages = convertToUIMessages(messagesFromDb);

	return {
		session,
		chat,
		messagesFromDb,
		uiMessages
	};
}
