import { form, getRequestEvent, query } from '$app/server';
import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const getUser = query(async () => {
	const { request } = getRequestEvent();
	const session = await auth.api.getSession(request);

	return session?.user ?? null;
});

export const getLastLoginMethod = query(async () => {
	const { cookies } = getRequestEvent();
	return cookies.get('better-auth.last_used_login_method') ?? null;
});

export const signInMagicLink = form(
	z.object({
		email: z.email('Invalid email address')
	}),
	async ({ email }) => {
		const { request } = getRequestEvent();

		console.log('signInMagicLink', email);

		redirect(307, '/verify');
	}
);

export const signInGoogle = form('unchecked', async () => {
	const { request } = getRequestEvent();

	const response = await auth.api.signInSocial({ headers: request.headers, body: { provider: 'google' } });

	if (response.redirect && response.url) {
		redirect(307, response.url);
	}
});

export const signOut = form('unchecked', async () => {
	const { request } = getRequestEvent();

	await auth.api.signOut({ headers: request.headers });

	redirect(307, '/');
});
