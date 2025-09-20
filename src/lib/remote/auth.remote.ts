import { form, getRequestEvent, query } from '$app/server';
import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const getUser = query(async () => {
	const { locals } = getRequestEvent();
	const { user } = locals;
	return user;
});

export const register = form(
	z.object({
		name: z.string().min(1, 'Name is required'),
		email: z.string().min(1, 'Email is required'),
		password: z.string().min(1, 'Password is required')
	}),
	async ({ name, email, password }) => {
		let redirectTo;

		try {
			await auth.api.signUpEmail({
				body: {
					name,
					email,
					password
				}
			});

			redirectTo = '/';
		} catch (error) {
			return {
				invalid: (error as any).body?.message || 'Registration failed'
			};
		}

		if (redirectTo) {
			redirect(307, redirectTo);
		}
	}
);

export const signInEmail = form(
	z.object({
		email: z.string().min(1, 'Email is required'),
		password: z.string().min(1, 'Password is required')
	}),
	async ({ email, password }) => {
		const { request } = getRequestEvent();

		let redirectTo;

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					rememberMe: true
				},
				headers: request.headers
			});

			redirectTo = '/';
		} catch (error) {
			return {
				invalid: (error as any).body?.message || 'Registration failed'
			};
		}

		if (redirectTo) {
			redirect(307, redirectTo);
		}
	}
);

export const signOut = form('unchecked', async () => {
	const { request } = getRequestEvent();

	await auth.api.signOut({ headers: request.headers });

	redirect(307, '/');
});
