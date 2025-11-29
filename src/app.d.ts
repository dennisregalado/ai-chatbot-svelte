// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Session, User } from '$lib/auth';
import type { BetterAuth } from "$lib/auth";
import type { DrizzleClient } from "$lib/server/db";

declare global {
	namespace App {
		interface Platform {
            env: Env;
            cf: CfProperties;
            ctx: ExecutionContext;
        }
		interface Locals {
			user?: User;
			session?: Session;
			auth: BetterAuth;
			db: DrizzleClient;
		}
		// interface PageData {}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
