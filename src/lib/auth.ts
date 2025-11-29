import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from '../lib/server/db/queries';
import * as schema from '../lib/server/db/schema';
import { getRequestEvent } from '$app/server';
import { BETTER_AUTH_SECRET, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { magicLink, organization, lastLoginMethod, oneTap } from 'better-auth/plugins';
import { onboarding, createOnboardingStep } from '@better-auth-extended/onboarding';
import { preferences, createPreferenceScope } from '@better-auth-extended/preferences';
import { z } from 'zod';
import { resend } from './resend';

export const auth = betterAuth({
	baseURL: 'http://localhost:5173',
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	emailAndPassword: {
		enabled: false
	},
	socialProviders: {
		google: {
			clientId: PUBLIC_GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		}
	},
	user: {
		additionalFields: {
			firstName: {
				type: 'string',
				required: false
			},
			lastName: {
				type: 'string',
				required: false
			}
		}
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
				enabled: true
			}
		}),
		magicLink({
			sendMagicLink: async ({ email, url, token }, ctx) => {
				console.log('Sending magic link to', email, url, token);

				// Send the email via Resend
				try {
					const response = await resend.emails.send({
						from: 'onboarding@resend.dev', // Use Resend's testing domain (replace with your verified domain in production)
						to: email,
						subject: 'Your Magic Link for sign-in',
						html: `
					<p>Click the link below to sign in:</p>
					<a href="${url}">Sign In</a>
					<p>If you didn't request this, ignore this email.</p>
					<p>Token (for manual verification): ${token}</p>
				  ` // Basic HTML; customize as needed
					});
					console.log(`Magic link sent to ${email}`, response);
				} catch (error) {
					console.error('Error sending magic link:', error);
					throw new Error('Failed to send magic link');
				}
			}
			//    disableSignUp: true, // Allow auto-signup for new users
		}),
		oneTap({
			clientId: PUBLIC_GOOGLE_CLIENT_ID
		}),
		lastLoginMethod(),
		onboarding({
			steps: {
				profile: createOnboardingStep({
					input: z.object({
						firstName: z.string().min(2, 'First name must be at least 2 characters'),
						lastName: z.string().min(2, 'Last name must be at least 2 characters')
					}),
					async handler(ctx) {
						const { firstName, lastName } = ctx.body;
						const session = ctx.context.session;

						if (!session) {
							throw ctx.error('UNAUTHORIZED');
						}

						const userId = session.user.id;

						// Update user profile
						await ctx.context.adapter.update({
							model: 'user',
							where: [{ field: 'id', value: userId }],
							update: { firstName, lastName, name: `${firstName} ${lastName}` }
						});

						return { success: true, updatedUser: { firstName, lastName } };
					},
					required: true,
					once: true
				}),
				workspace: createOnboardingStep({
					input: z.object({
						workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters')
					}),
					async handler(ctx) {
						const session = ctx.context.session;

						if (!session) {
							throw ctx.error('UNAUTHORIZED');
						}
						// Workspace step handler - can be extended later
						return { success: true };
					},
					required: true
				}),
				plan: createOnboardingStep({
					input: z.object({
						plan: z.enum(['free', 'pro'])
					}),
					async handler(ctx) {
						const session = ctx.context.session;

						if (!session) {
							throw ctx.error('UNAUTHORIZED');
						}
						// Plan step handler - can be extended later
						return { success: true };
					},
					required: true
				})
			},
			completionStep: 'plan'
		}) as any,
		preferences({
			scopes: {
				user: createPreferenceScope({
					preferences: {
						theme: { type: z.enum(['light', 'dark', 'system']) }
					},
					defaultValues: {
						theme: 'system'
					}
				})
			}
		}),
		// must be last in plugins array
		sveltekitCookies(getRequestEvent)
	]
});

type AuthSession = typeof auth.$Infer.Session;

export type Session = AuthSession['session'];

export type User = AuthSession['user'];
