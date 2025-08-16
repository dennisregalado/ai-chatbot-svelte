import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';

export const GET = async (event) => {
	const { request, locals } = event;
	const { session } = locals;

	if (session) {
		//     redirect(307, new URL('/', request.url));
	}

	const guest = await auth.api.signInAnonymous({ headers: event.request.headers });

	console.log('guest', guest);

	return new Response('test', { status: 200 });
};
