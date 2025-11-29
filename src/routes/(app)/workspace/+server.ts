import { error, redirect } from '@sveltejs/kit';
import { getActiveWorkspace } from '$remote/workspace.remote';
import { shouldOnboard } from '$remote/onboarding.remote';

export async function GET({ locals }) {
	const { session } = locals;

	if (!session) {
		redirect(302, '/signin');
	}

	const shouldRedirectToWelcome = await shouldOnboard();

	if (shouldRedirectToWelcome) {
		redirect(302, '/welcome');
	}

	const workspace = await getActiveWorkspace();

	if (!workspace) {
		error(404, 'Workspace not found');
	}

	redirect(302, `/${workspace.slug}`);
}
