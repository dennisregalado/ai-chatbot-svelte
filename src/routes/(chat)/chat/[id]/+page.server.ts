import { getChatById } from '$remote/chat.remote.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params: { id }, locals: { session }, cookies }) {
	const chat = await getChatById(id);

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

	const chatModelFromCookie = cookies.get('chat-model');

	return {
		chat,
		chatModelFromCookie,
		session
	};
}
