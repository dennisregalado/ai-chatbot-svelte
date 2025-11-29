import { redirect } from '@sveltejs/kit';

export async function GET({ locals }) {
	const { session } = locals;

	console.log('session', session);

	if (!session) {
		redirect(302, '/signin');
	}
}
