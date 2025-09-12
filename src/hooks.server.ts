import { auth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { createResumableStreamContext, type ResumableStreamContext } from 'resumable-stream';
import { waitUntil } from '@vercel/functions';
import { createClient } from 'redis';
import { REDIS_URL } from '$env/static/private';

let globalStreamContext: ResumableStreamContext | null = null;

export async function handle({ event, resolve }) {

	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}


	event.locals.getStreamContext = () => {

		console.log('REDIS_URL', process.env.REDIS_URL);


		if (!globalStreamContext) {
			try {
				globalStreamContext = createResumableStreamContext({
					waitUntil,
					subscriber: createClient({
						url: REDIS_URL,
					}),
					publisher: createClient({
						url: REDIS_URL,
					}),
				});
			} catch (error: any) {
				console.error('new error', error);
				if (error.message.includes('REDIS_URL')) {
					console.log(' > Resumable streams are disabled due to missing REDIS_URL');
				} else {
					console.error(error);
				}
			}
		}

		return globalStreamContext!;
	};

	return svelteKitHandler({ event, resolve, auth, building });
}
