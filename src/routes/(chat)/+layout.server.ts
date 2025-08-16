export async function load({ cookies, locals: { user } }) {
	const isCollapsed = cookies.get('sidebar:state') !== 'true';

	return {
		isCollapsed,
		user
	};
}
