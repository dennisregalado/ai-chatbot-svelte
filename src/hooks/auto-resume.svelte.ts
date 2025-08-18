// completed
import type { ChatMessage } from '$lib/types';
import { useDataStream } from '$components/data-stream-provider.svelte';
import type { Chat } from '@ai-sdk/svelte';

export interface AutoResumeParams {
	autoResume: boolean;
	initialMessages: ChatMessage[];
	chat: Chat<ChatMessage>;
}

export class AutoResume {
	#autoResume: boolean;
	#initialMessages: ChatMessage[];
	#chat: Chat<ChatMessage>;

	constructor({ autoResume, initialMessages, chat }: AutoResumeParams) {
		this.#autoResume = autoResume;
		this.#initialMessages = initialMessages;
		this.#chat = chat;

		const { dataStream } = useDataStream();


		// Effect to resume stream if auto-resume is enabled and last message is from user
		// We run this once on initialization
		$effect(() => {
			if (!this.#autoResume) return;

			const mostRecentMessage = this.#initialMessages.at(-1);

			if (mostRecentMessage?.role === 'user') {
				this.#chat.resumeStream();
			}
		});

		$effect(() => {
			if (!dataStream) return;
			if (dataStream.length === 0) return;

			const dataPart = dataStream[0];

			if (dataPart.type === 'data-appendMessage') {
				const message = JSON.parse(dataPart.data);
				this.#chat.messages = [...this.#initialMessages, message];
			}
		});

		// Note: Message appending is handled automatically by the Chat's onData callback
		// which processes the dataStream and updates the messages internally
	}
}
