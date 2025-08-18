import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai';
import { createXai } from '@ai-sdk/xai';
// import { createGroq } from '@ai-sdk/groq';
import { XAI_API_KEY } from '$env/static/private';

const xai = createXai({ apiKey: XAI_API_KEY });
// const groq = createGroq({ apiKey: GROQ_API_KEY });

export const myProvider = customProvider({
	languageModels: {
		'chat-model': xai('grok-2-vision-1212'),
		'chat-model-reasoning': wrapLanguageModel({
			model: xai('grok-3-mini-beta'),
			middleware: extractReasoningMiddleware({ tagName: 'think' })
		}),
		'title-model': xai('grok-2-1212'),
		'artifact-model': xai('grok-2-1212')
	},
	imageModels: {
		'small-model': xai.imageModel('grok-2-image')
	}
});
