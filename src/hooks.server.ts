import { auth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { waitUntil } from '@vercel/functions';
import { createClient } from 'redis';
import { createResumableStreamContext } from 'resumable-stream/redis';
import { env } from '$env/dynamic/private';
import type { ServerInit } from '@sveltejs/kit';

let publisherClient: ReturnType<typeof createClient> | null = null;
let subscriberClient: ReturnType<typeof createClient> | null = null;

export const init: ServerInit = async () => {

	if (!env.REDIS_URL) {
		console.error('Resumable Streams are not configured');
		return;
	}

	// Initialize Redis connections early to fail fast if Redis is unavailable
	try { 
		publisherClient = createClient({ url: env.REDIS_URL! });
		subscriberClient = createClient({ url: env.REDIS_URL! });

		// Connect both clients
		await Promise.all([
			publisherClient.connect(),
			subscriberClient.connect()
		]);
	} catch (error) {
		console.error('❌ Failed to configure Resumable Streams:', error);
	}
};

const getPublisher = () => {
	if (!publisherClient) {
		throw new Error('Redis publisher not initialized. Make sure the init hook has run.');
	}
	return publisherClient;
};

const getSubscriber = () => {
	if (!subscriberClient) {
		throw new Error('Redis subscriber not initialized. Make sure the init hook has run.');
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
		const publisher = getPublisher();
		const subscriber = getSubscriber();

		return Promise.resolve(createResumableStreamContext({
			waitUntil,
			publisher,
			subscriber
		}));
	};

	return svelteKitHandler({ event, resolve, auth, building });
}
