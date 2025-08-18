import { registerOTel } from '@vercel/otel';

registerOTel({
    serviceName: 'ai-chatbot-svelte'
});