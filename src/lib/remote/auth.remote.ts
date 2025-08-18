import { form, getRequestEvent, query } from '$app/server';
import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

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
	const email = formData.get('email');
	const password = formData.get('password');


});

export const signOut = form(async () => {
	const { request } = getRequestEvent();

	await auth.api.signOut({ headers: request.headers });

	redirect(307, '/');
});
