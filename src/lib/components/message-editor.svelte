<script lang="ts">
	import type { ChatMessage } from '$lib/types';
	import type { Chat } from '@ai-sdk/svelte';
	import { deleteTrailingMessages } from '$remote/chat.remote';
	import { getTextFromMessage } from '$lib/utils';
	import Button from '$components/ui/button/button.svelte';
	import Textarea from '$components/ui/textarea/textarea.svelte';

	let {
		message,
		mode = $bindable(),
		messages,
		regenerate
	}: {
		message: ChatMessage;
		mode: 'edit' | 'view';
		messages: ChatMessage[];
		regenerate: Chat['regenerate'];
	} = $props();

	let isSubmitting = $state(false);
	let draftContent = $state(getTextFromMessage(message));
	let textareaRef = $state<HTMLTextAreaElement | null>(null);

	$effect(() => {
		if (textareaRef) {
			adjustHeight();
		}
	});

	function adjustHeight() {
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = `${textareaRef.scrollHeight + 2}px`;
		}
	}

	function handleInput(event: Event) {
		draftContent = (event.target as HTMLTextAreaElement).value;
		adjustHeight();
	}
</script>

<div class="flex w-full flex-col gap-2">
	<Textarea
		data-testid="message-editor"
		bind:ref={textareaRef}
		class="w-full resize-none overflow-hidden rounded-xl bg-transparent !text-base outline-none"
		bind:value={draftContent}
		oninput={handleInput}
	/>

	<div class="flex flex-row justify-end gap-2">
		<Button variant="outline" class="h-fit px-3 py-2" onclick={() => (mode = 'view')}>Cancel</Button
		>
		<Button
			data-testid="message-editor-send-button"
			variant="default"
			class="h-fit px-3 py-2"
			disabled={isSubmitting}
			onclick={async () => {
				isSubmitting = true;

				await deleteTrailingMessages({
					id: message.id
				});

				const index = messages.findIndex((m) => m.id === message.id);
				if (index !== -1) {
					const updatedMessage: ChatMessage = {
						...message,
						parts: [{ type: 'text', text: draftContent }]
					};
					messages = [...messages.slice(0, index), updatedMessage, ...messages.slice(index + 1)];
				}

				mode = 'view';
				regenerate();
			}}
		>
			{isSubmitting ? 'Sending...' : 'Send'}
		</Button>
	</div>
</div>
