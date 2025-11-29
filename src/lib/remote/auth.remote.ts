import { form, getRequestEvent, query } from '$app/server';
import { redirect, error } from '@sveltejs/kit';
import { z } from 'zod';

export const getUser = query(async () => {
	const { request, locals } = getRequestEvent();
	const { auth } = locals;

	const session = await auth.api.getSession(request);

	return session?.user ?? null;
});

export const getSession = query(async () => {
	const { request, locals } = getRequestEvent();
	const { auth } = locals;

	const session = await auth.api.getSession(request);

	return session?.session ?? null;
});

export const getLastLoginMethod = query(async () => {
	const { cookies } = getRequestEvent();

	return cookies.get('better-auth.last_used_login_method') ?? null;
});

export const signInMagicLink = form(
	z.object({
		email: z.email('Please enter a valid email address')
	}),
	async ({ email }) => {
		const { request, locals } = getRequestEvent();
		const { auth } = locals;

		try {
			await (auth.api as any).signInMagicLink({
				headers: request.headers,
				body: {
					email,
					callbackURL: '/workspace',
					newUserCallbackURL: '/welcome'
				}
			});
		} catch (e) {
			error(500, 'Failed to sign in with magic link');
		} finally {
			redirect(307, `/verify/${email}`);
		}
	}
);

export const signInGoogle = form('unchecked', async () => {
	const { request, locals } = getRequestEvent();
	const { auth } = locals;
	let response = null;

	try {
		response = await (auth.api as any).signInSocial({
			headers: request.headers,
			body: {
				provider: 'google',
				callbackURL: "/workspace",
				newUserCallbackURL: "/welcome",
			}
		});
	} catch (e) {
		error(500, 'Failed to sign in with Google');
	} finally {
		if (response && response.redirect && response.url) {
			redirect(307, response.url);
		}
	}
});

export const signOut = form('unchecked', async () => {
	const { request, locals } = getRequestEvent();
	const { auth } = locals;

	try {
		await (auth.api as any).signOut({ headers: request.headers });
	} catch (e) {
		error(500, 'Failed to sign out');
	} finally {
		redirect(307, '/signin');
	}
});
