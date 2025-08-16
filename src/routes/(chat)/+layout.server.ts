export async function load({ cookies, locals: { session } }) {
	const isCollapsed = cookies.get('sidebar:state') !== 'true';

	return {
		isCollapsed,
		session
	};
}
