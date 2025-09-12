import { auth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { waitUntil } from '@vercel/functions';
import { createClient } from 'redis';
import { createResumableStreamContext } from 'resumable-stream/redis';
import { env } from '$env/dynamic/private';

let publisherClient: ReturnType<typeof createClient> | null = null;
let subscriberClient: ReturnType<typeof createClient> | null = null;

export const getPublisher = async () => {
	if (!publisherClient) {
		publisherClient = createClient({ url: env.REDIS_URL! });
		await publisherClient.connect();
	}
	return publisherClient;
};

export const getSubscriber = async () => {
	if (!subscriberClient) {
		subscriberClient = createClient({ url: env.REDIS_URL! });
		await subscriberClient.connect();
	}
	return subscriberClient;
};

export async function handle({ event, resolve }) {

	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}


	event.locals.getStreamContext = async () => {
		const [publisher, subscriber] =
			await Promise.all([getPublisher(), getSubscriber()]);

		return createResumableStreamContext({
			waitUntil,
			publisher,
			subscriber
		});
	};

	return svelteKitHandler({ event, resolve, auth, building });
}




