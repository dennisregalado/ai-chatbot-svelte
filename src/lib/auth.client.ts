import { createAuthClient } from 'better-auth/client';
import { oneTapClient } from 'better-auth/client/plugins';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

export const authClient = createAuthClient({
	plugins: [
		oneTapClient({
			clientId: PUBLIC_GOOGLE_CLIENT_ID,
			context: 'use'
		})
	]
});
