import { createAuth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { getDb } from '$lib/server/db';
import { env } from '$env/dynamic/private';

export async function handle({ event, resolve }) {
	const { platform } = event;

	let db = getDb(platform?.env.DATABASE, env.DATABASE_URL);
	let auth = createAuth(platform?.env, platform?.cf);

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
