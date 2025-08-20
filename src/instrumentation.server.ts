// https://svelte.dev/blog/sveltekit-integrated-observability
import { registerOTel } from '@vercel/otel';

registerOTel({
	serviceName: 'ai-chatbot-svelte'
});
