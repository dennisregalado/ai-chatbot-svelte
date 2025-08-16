export async function load({ cookies, locals }) {
	const session = await locals.auth();
	const isCollapsed = cookies.get('sidebar:state') !== 'true';

	return {
		isCollapsed,
		session
	};
}
