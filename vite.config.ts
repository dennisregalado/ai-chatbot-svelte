import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const AGENT_HOST = 'http://localhost:5174';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		proxy: {
			// Proxy WebSocket connections for the agent
			'/agents': {
				target: AGENT_HOST,
				changeOrigin: true,
				ws: true,
				rewriteWsOrigin: true
			}
		}
	}
});
