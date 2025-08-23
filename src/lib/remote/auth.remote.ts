import { form, getRequestEvent, query } from '$app/server';
import { auth } from '$lib/auth';
import { error, fail, redirect } from '@sveltejs/kit';

export const getSession = query(async () => {
	const { locals } = getRequestEvent();
	const { session } = locals;
	return session;
});

export const getUser = query(async () => {
	const { locals } = getRequestEvent();
	const { user } = locals;
	return user;
});

export const signInEmail = form(async (formData) => {
	const { request } = getRequestEvent();

	const email = formData.get('email');
	const password = formData.get('password');

	const response = await auth.api.signInEmail({
		body: {
			email: email as string,
			password: password as string,
			rememberMe: true
		},
		headers: request.headers
	}).catch((error) => {
		return {
			error: error.body.message,
		};
	});

	if (response?.error) {
		return response
	}

	redirect(307, '/');
});

export const register = form(async (formData) => {

	const name = formData.get('name');
	const email = formData.get('email');
	const password = formData.get('password');

	let redirectTo;

	try {
		await auth.api.signUpEmail({
			body: {
				name: name as string,
				email: email as string,
				password: password as string,
			}
		});

		redirectTo = "/"
	} catch (error) {
		console.log(error);
		return error.body.message
	}

	if (redirectTo) {
		redirect(307, redirectTo);
	}
});

export const signOut = form(async () => {
	const { request } = getRequestEvent();

	await auth.api.signOut({ headers: request.headers });

	redirect(307, '/');
});
