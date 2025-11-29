// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Session, User } from '$lib/auth'; 

declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session; 
		}
		// interface PageData {}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
