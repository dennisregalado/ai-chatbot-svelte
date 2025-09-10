import { generateUUID } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { allowGuestAccounts } from '$server/config';

export async function load({ locals }) {
	const { session} = locals;

	if (allowGuestAccounts && !session) {
		redirect(302, '/guest');
	}

	const id = generateUUID();

	return {
		id
	};
}
