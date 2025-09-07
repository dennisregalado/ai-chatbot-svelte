import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { allowGuestAccounts } from '$server/config';

export const GET = async (event) => {
	const { request, locals } = event;
	const { session } = locals;

	if (session) {
		redirect(307, '/');
	}

  if (!allowGuestAccounts) {
    redirect(307, '/login');
  }

	await auth.api.signInAnonymous({ headers: request.headers });

	redirect(307, '/');
};
