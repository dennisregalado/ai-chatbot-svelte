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
