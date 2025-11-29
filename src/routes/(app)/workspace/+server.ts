import { error, redirect } from '@sveltejs/kit';
import { getActiveWorkspace } from '$remote/workspace.remote';

export async function GET({ locals }) {
	const { session } = locals;

	if (!session) {
		redirect(302, '/signin');
	}

	const workspace = await getActiveWorkspace();

	if (!workspace) {
		error(404, 'Workspace not found');
	}

	redirect(302, `/${workspace.slug}`);
}
