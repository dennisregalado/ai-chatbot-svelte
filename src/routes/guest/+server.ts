import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';

export const GET = async (event) => {

	const { request, locals } = event;
	const { session } = locals;

	if (session) {
		redirect(307, "/");
	}

	await auth.api.signInAnonymous({ headers: request.headers });

	redirect(307, '/');
};
