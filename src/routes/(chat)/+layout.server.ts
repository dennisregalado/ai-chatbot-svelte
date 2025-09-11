export async function load({ cookies, locals: { user } }) {
	return {
		isCollapsed: cookies.get('sidebar:state') !== 'true',
		user
	};
}
