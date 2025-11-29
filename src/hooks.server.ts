import { createAuth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment'; 
import { env } from '$env/dynamic/private';
import type { IncomingRequestCfProperties } from '@cloudflare/workers-types';

export async function handle({ event, resolve }) {
	const { platform } = event;
 
	let auth = createAuth(env, platform?.cf as IncomingRequestCfProperties);
	
	event.locals.auth = auth;

	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {

		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
}
