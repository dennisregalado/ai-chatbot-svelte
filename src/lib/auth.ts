import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit'; 
import { db } from '$server/db/queries';
import * as schema from '$server/db/schema';
import { getRequestEvent } from '$app/server';
import { BETTER_AUTH_SECRET, POLAR_ACCESS_TOKEN } from '$env/static/private'; 
import { polar, checkout, portal, usage } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';

export const polarClient = new Polar({
	accessToken: POLAR_ACCESS_TOKEN,
	// Use 'sandbox' if you're using the Polar Sandbox environment
	// Remember that access tokens, products, etc. are completely separated between environments.
	// Access tokens obtained in Production are for instance not usable in the Sandbox environment.
	server: 'sandbox'
});

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
		polar({
			client: polarClient,
			createCustomerOnSignUp: true,
			use: [
				checkout({
					products: [
						{
							productId: '4c5651eb-6fc0-4bc5-845c-9468fe08546d', // ID of Product from Polar Dashboard
							slug: 'pro' // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
						}
					],
					successUrl: '/success?checkout_id={CHECKOUT_ID}',
					authenticatedUsersOnly: true
				}),
				portal(),
				usage()
			]
		})
	]
});

type AuthSession = typeof auth.$Infer.Session;

export type Session = AuthSession['session'];

export type User = AuthSession['user'];
