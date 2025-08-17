export async function load({ cookies, locals: { user, session } }) {
	const isCollapsed = cookies.get('sidebar:state') !== 'true';

	return {
		isCollapsed,
		session,
		user
	};
}
