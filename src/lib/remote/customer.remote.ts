import { getRequestEvent, query } from '$app/server';
import { auth } from '$lib/auth';
import { error } from '@sveltejs/kit';

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

	console.log('meters', meters);
	meters.result;

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
