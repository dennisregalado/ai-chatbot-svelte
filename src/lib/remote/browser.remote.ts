import { query } from '$app/server';

export const getBrowserTabs = query(async () => {
	return [
		{
			pathname: '/knowledge',
			label: 'Knowledge'
		},
		{
			pathname: '/chat',
			label: 'Chat'
		},
		{
			pathname: '/people',
			label: 'People'
		},
		{
			pathname: '/agents',
			label: 'Agents'
		},
		{
			pathname: '/inboxes',
			label: 'Inboxes'
		}
	];
});
