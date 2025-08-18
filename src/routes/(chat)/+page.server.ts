import { generateUUID } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const { session } = locals;

	if (!session) {
		redirect(302, '/guest');
	}

	const id = generateUUID();

	return {
		id
	};
}
