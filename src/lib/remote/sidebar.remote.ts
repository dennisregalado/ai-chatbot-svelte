import { getRequestEvent, query } from '$app/server';

export const getSidebarState = query(async () => {
	const { cookies } = getRequestEvent();
	return cookies.get('sidebar:state') !== 'true';
});
