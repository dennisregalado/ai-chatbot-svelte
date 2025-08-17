import { generateUUID } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ locals, cookies }) {
	const { session } = locals;

	if (!session) {
	 redirect(302, '/guest');
	}

	const id = generateUUID();
	const modelIdFromCookie = cookies.get('chat-model');

	return {
		id,
		modelIdFromCookie,
		session
	};
}
