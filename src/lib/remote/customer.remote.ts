import { getRequestEvent, query, form } from '$app/server';
import { auth } from '$lib/auth';
import { error } from '@sveltejs/kit';
import * as db from '$server/db/queries';
import z from 'zod';

const SENTIMENTS = new Set(['sad', 'neutral', 'happy']);

export const getCustomer = query(async () => {
	const { locals, request } = getRequestEvent();
	const { user } = locals;

	if (!user) {
		error(401, 'Unauthorized');
	}

	return await auth.api.state({
		headers: request.headers
	});
});

export const getMonthlyCredits = query(async () => {
	const { locals, request } = getRequestEvent();
	const { user } = locals;

	if (!user) {
		error(401, 'Unauthorized');
	}

	const meters = await auth.api.meters({
		query: {
			page: 1,
			limit: 1
		},
		headers: request.headers
	});

	return '4.93';
});

export const getSubscription = query(async () => {
	const { locals } = getRequestEvent();
	const { user } = locals;

	if (!user) {
		error(401, 'Unauthorized');
	}

	return 'pro';
});

export const submitFeedback = form(
	z.object({
		message: z.string().min(1, 'Message is required'),
		sentiment: z.string().min(1, 'Sentiment is required')
	}),
	async ({ message, sentiment: sentimentRaw }) => {
		const {
			locals: { user }
		} = getRequestEvent();

		if (!user) {
			error(401, 'Unauthorized');
		}

		const sentiment = SENTIMENTS.has(sentimentRaw)
			? (sentimentRaw as 'sad' | 'neutral' | 'happy')
			: 'neutral';

		await db.saveFeedback({
			userId: user.id,
			message: message.trim() === '' ? null : message.trim(),
			sentiment
		});
	}
);
