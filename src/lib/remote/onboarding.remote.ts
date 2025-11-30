import { getRequestEvent, query } from '$app/server';

export const shouldOnboard = query(async () => {
	const { request, locals } = getRequestEvent();
	const { auth } = locals;

	return false;
});
