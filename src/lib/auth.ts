import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$server/db/queries';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { anonymous } from 'better-auth/plugins';
import * as schema from '$server/db/schema';
import { BETTER_AUTH_SECRET } from '$env/static/private';

export const auth = betterAuth({
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	emailAndPassword: {
		enabled: true
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60
		}
	},
	plugins: [sveltekitCookies(getRequestEvent), anonymous()]
});

type AuthSession = typeof auth.$Infer.Session;

export type Session = AuthSession['session'];

export type User = AuthSession['user'];
