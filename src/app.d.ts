// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Session, User } from 'better-auth';
import type { ResumableStreamContext } from 'resumable-stream';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User & { isAnonymous?: boolean };
			session?: Session;
			getStreamContext: () => ResumableStreamContext;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
