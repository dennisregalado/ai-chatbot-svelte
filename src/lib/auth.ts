import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import * as schema from '../lib/server/db/schema';
import { getRequestEvent } from '$app/server';
import { GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { magicLink, organization, lastLoginMethod, oneTap } from 'better-auth/plugins';
import { onboarding, createOnboardingStep } from '@better-auth-extended/onboarding';
import { preferences, createPreferenceScope } from '@better-auth-extended/preferences';
import { z } from 'zod';
import { resend } from './resend';
import type { D1Database, IncomingRequestCfProperties, KVNamespace, R2Bucket } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { withCloudflare } from "better-auth-cloudflare";
import { env as cloudflareEnv } from '$env/dynamic/private';

// Single auth configuration that handles both CLI and runtime scenarios
function createAuth(env?: typeof cloudflareEnv, cf?: IncomingRequestCfProperties) {
	// Use actual DB for runtime, empty object for CLI
	const db = env ? drizzle(env.DATABASE, { schema, logger: true }) : ({} as any);

	// Base URL for auth callbacks (magic links, OAuth redirects, etc.)
	const baseURL = env?.BASE_URL || "http://localhost:5173";

	return betterAuth({
		baseURL,
		...withCloudflare(
			{
				autoDetectIpAddress: true,
				geolocationTracking: true,
				cf: cf || {},
				d1: env
					? {
						db,
						options: {
							usePlural: true,
							debugLogs: true,
						},
					}
					: undefined,
				kv: env?.KV as KVNamespace,
				r2: {
					bucket: env?.R2_BUCKET as R2Bucket,
					maxFileSize: 10 * 1024 * 1024, // 10MB
					allowedTypes: [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx"],
					additionalFields: {
						category: { type: "string", required: false },
						isPublic: { type: "boolean", required: false },
						description: { type: "string", required: false },
					},
				},
			},
			{
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
				experimental: { joins: true },
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
					}),
					preferences({
						scopes: {
							user: createPreferenceScope({
								preferences: {
									theme: { type: z.enum(['light', 'dark', 'system']) },
								},
								defaultValues: {
									theme: 'system'
								}
							})
						}
					}),
					sveltekitCookies(getRequestEvent)
				],
				rateLimit: {
					enabled: true,
					window: 60, // Minimum KV TTL is 60s
					max: 100, // reqs/window
					customRules: {
						// https://github.com/better-auth/better-auth/issues/5452
						"/sign-in/email": {
							window: 60,
							max: 100,
						},
						"/sign-in/social": {
							window: 60,
							max: 100,
						},
					},
				},
			}
		),
		// Only add database adapter for CLI schema generation
		...(env
			? {}
			: {
				database: drizzleAdapter({} as D1Database, {
					provider: "sqlite",
					usePlural: true,
					debugLogs: true,
				}),
			}),
	});
}

type AuthSession = typeof auth.$Infer.Session;

export type Session = AuthSession['session'];

export type User = AuthSession['user'];

// Export for CLI schema generation
export const auth = createAuth();

// Export for runtime usage
export { createAuth };