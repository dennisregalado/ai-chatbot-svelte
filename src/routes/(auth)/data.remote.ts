import { form } from '$app/server';
import { createUser, getUser } from '$server/db/queries';
import z from 'zod';

const authFormSchema = z.object({
	email: z.email(),
	password: z.string().min(6)
});

export const login = form(async (formData) => {
	try {
		const validatedData = authFormSchema.parse({
			email: formData.get('email'),
			password: formData.get('password')
		});

		//      await signIn('credentials', {
		//   email: validatedData.email,
		//    password: validatedData.password,
		//    redirect: false,
		//});

		//  return { status: 'success' };
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

		const [user] = await getUser(validatedData.email);

		if (user) {
			return { status: 'user_exists' } as RegisterActionState;
		}
		await createUser(validatedData.email, validatedData.password);
		//    await signIn('credentials', {
		//        email: validatedData.email,
		//        password: validatedData.password,
		//        redirect: false,
		//    });

		//    return { status: 'success' };
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
