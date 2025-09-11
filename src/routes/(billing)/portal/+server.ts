// /api/portal/+server.ts
import { POLAR_ACCESS_TOKEN } from '$env/static/private';
import { CustomerPortal } from '@polar-sh/sveltekit';
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const GET = CustomerPortal({
	accessToken: POLAR_ACCESS_TOKEN,
	getCustomerId: async (event) => {
		if (!event.locals.user) {
			error(401, 'Unauthorized');
		}
		return event.locals.user?.id;
	},
	// In Development
	server: 'sandbox' // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise

	// After Polar is setup for Production
	// server: dev ? "sandbox" : "production"
});
