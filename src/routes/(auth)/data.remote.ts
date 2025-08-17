import { form } from '$app/server';
import { auth } from '$lib/auth';
import z from 'zod';

const authFormSchema = z.object({
	email: z.email(),
	password: z.string().min(6)
});

export const signInEmail = form(async (formData) => {
	try {
		const validatedData = authFormSchema.parse({
			email: formData.get('email'),
			password: formData.get('password')
		});

		const user = await auth.api.signInEmail({
			body: {
				email: validatedData.email,
				password: validatedData.password
			}
		});

		return { status: 'success' };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { status: 'invalid_data' };
		}

		return { status: 'failed' };
	}
});

export const register = form(async (formData) => {
	try {
		const validatedData = authFormSchema.parse({
			email: formData.get('email'),
			password: formData.get('password')
		});

		const user = await auth.api.signUpEmail({
			body: {
				name: validatedData.email.split('@')[0], // Use email prefix as name
				email: validatedData.email,
				password: validatedData.password
			}
		});

		console.log(user);

		return { status: 'success' };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { status: 'invalid_data' };
		}

		return { status: 'failed' };
	}
});

export interface LoginActionState {
	status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export interface RegisterActionState {
	status: 'idle' | 'in_progress' | 'success' | 'failed' | 'user_exists' | 'invalid_data';
}
