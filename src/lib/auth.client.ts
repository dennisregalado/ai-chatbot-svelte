import { createAuthClient } from 'better-auth/client';
import { oneTapClient } from 'better-auth/client/plugins';
import { passkeyClient } from "@better-auth/passkey/client"
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { cloudflareClient } from 'better-auth-cloudflare/client';

export const authClient = createAuthClient({
	plugins: [
		cloudflareClient(),
		passkeyClient(),
		oneTapClient({
			clientId: PUBLIC_GOOGLE_CLIENT_ID,
			context: 'use'
		})
	]
});
