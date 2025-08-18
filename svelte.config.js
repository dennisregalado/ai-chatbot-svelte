import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true,
			tracing: {
				server: true
			},
			instrumentation: {
				server: true
			}
		},
		alias: {
			$ai: './src/lib/ai',
			$remote: './src/lib/remote',
			$server: './src/lib/server',
			$hooks: './src/hooks',
			$artifacts: './src/artifacts',
			$components: './src/lib/components'
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
