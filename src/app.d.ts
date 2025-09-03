// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Session, User } from '$lib/auth';
import type { ResumableStreamContext } from 'resumable-stream';

declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
			getStreamContext: () => ResumableStreamContext;
		}
		interface PageData {
			user?: User;
		}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
