// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Session, User } from '$lib/auth';
import type { ResumableStreamContext } from 'resumable-stream';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User;
			session?: Session;
			getStreamContext: () => ResumableStreamContext;
		}
		interface PageData {
			selectedModelId: string;
			user?: User;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
