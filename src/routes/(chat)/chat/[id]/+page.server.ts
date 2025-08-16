import { getChatById } from '$server/db/queries';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params: { id }, locals: { session }, cookies }) {
	const chat = await getChatById({ id });

	if (!chat) {
		error(404, 'Not found');
	}

	if (!session) {
		redirect(302, '/api/auth/guest');
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
