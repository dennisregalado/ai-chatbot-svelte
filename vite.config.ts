import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			// Workaround for upstream import of '@polar-sh/sdk/webhooks.ts'
			// which resolves to a non-existent 'dist/esm/webhooks.ts.js'.
			// The actual file is 'dist/esm/webhooks.js'.
			'@polar-sh/sdk/webhooks.ts': '@polar-sh/sdk/webhooks.js',
			'@polar-sh/sdk/webhooks': '@polar-sh/sdk/webhooks.js'
		}
	}
});
