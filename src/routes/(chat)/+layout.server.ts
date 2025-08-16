export async function load({ cookies, locals }) {
	const { user } = locals;
	const isCollapsed = cookies.get('sidebar:state') !== 'true';
	
	return {
		user,
		isCollapsed,
	};
}
