import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from '$server/db/queries';
import * as schema from '$server/db/schema';
import { getRequestEvent } from '$app/server';
import { BETTER_AUTH_SECRET, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { magicLink, organization, lastLoginMethod, oneTap } from 'better-auth/plugins';

export const auth = betterAuth({
	baseURL: 'http://localhost:5173',
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	emailAndPassword: {
		enabled: false,
	},
	socialProviders: {
		google: {
			clientId: PUBLIC_GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
		},
	},
	user: {
		additionalFields: {
			firstName: {
				type: "string",
				required: false,
			},
			lastName: {
				type: "string",
				required: false,
			},
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60
		}
	},
	plugins: [
		organization({
			teams: {
				enabled: true,
			},
		}),
		magicLink({
			sendMagicLink: async ({ email, token }) => {
				console.log('Sending magic link to email', email, token);
			}
		}),
		oneTap({
			clientId: PUBLIC_GOOGLE_CLIENT_ID
		}),
		lastLoginMethod(),
		sveltekitCookies(getRequestEvent),

	]
});

type AuthSession = typeof auth.$Infer.Session;

export type Session = AuthSession['session'];

export type User = AuthSession['user'];
