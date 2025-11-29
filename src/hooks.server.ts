import { createAuth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import type { IncomingRequestCfProperties } from '@cloudflare/workers-types';
import type { Handle } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { env } from "$env/dynamic/private";

export async function handle({ event, resolve }: Handle) {
	const { platform } = event;
	
	let db = getDb(platform.env.DATABASE, env.DATABASE_URL); 
	let auth = createAuth(platform.env as Env, platform?.cf as IncomingRequestCfProperties);

	event.locals.auth = auth;
	event.locals.db = db;
	
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
}