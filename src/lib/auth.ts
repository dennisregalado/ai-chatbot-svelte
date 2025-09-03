import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { anonymous } from 'better-auth/plugins';
import { db } from '$server/db/queries';
import * as schema from '$server/db/schema';
import { getRequestEvent } from '$app/server';
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
	plugins: [
		sveltekitCookies(getRequestEvent),
		anonymous()
		/**
		polar({
			client: polarClient,
			createCustomerOnSignUp: true,
			use: [
				checkout({
					products: [
						{
							productId: "123-456-789", // ID of Product from Polar Dashboard
							slug: "pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
						}
					],
					successUrl: "/success?checkout_id={CHECKOUT_ID}",
					authenticatedUsersOnly: true
				}),
				portal(),
				usage()
			]
		})
		*/
	]
});

type AuthSession = typeof auth.$Infer.Session;

export type Session = AuthSession['session'];

export type User = AuthSession['user'];
