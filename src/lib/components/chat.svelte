<script lang="ts">
	import { Agent } from '$lib/agents/index.svelte';
	import { AgentChat } from '$lib/agents/ai.svelte';

	import {
		Conversation,
		ConversationContent,
		ConversationScrollButton
	} from '$lib/components/ai-elements/conversation';

	import { Message, MessageContent } from '$lib/components/ai-elements/message';

	import { Response } from '$lib/components/ai-elements/response';
	import { Actions, Action } from '$lib/components/ai-elements/actions';

	import {
		Sources,
		SourcesTrigger,
		SourcesContent,
		Source
	} from '$lib/components/ai-elements/source';

	import {
		Reasoning,
		ReasoningTrigger,
		ReasoningContent
	} from '$lib/components/ai-elements/reasoning';

	import { Loader } from '$lib/components/ai-elements/loader';

	import {
		PromptInput,
		PromptInputAction,
		PromptInputActions,
		PromptInputTextarea
	} from '$lib/components/prompt-kit/prompt-input';

	import { Button } from '$lib/components/ui/button/index.js';

	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Square from '@lucide/svelte/icons/square';
	import X from '@lucide/svelte/icons/x';

	import CopyIcon from '@lucide/svelte/icons/copy';
	import RefreshCcwIcon from '@lucide/svelte/icons/refresh-cw';
	import { dev } from '$app/environment';

	let { id = '', messages: initialMessages = [] } = $props();

	// Connect to the chat agent
	const agent = new Agent({
		get name() {
			return id;
		},
		host: dev ? 'https://localhost:5174' : 'https://sveltekit-agent.dennisregalad.workers.dev',
		agent: 'chat',
		onStateUpdate(newState) {
			console.log(newState);
		}
	});

	// Use the AgentChat class with the agent connection
	const chat = new AgentChat({
		agent,
		onData: (dataPart) => {
			console.log(dataPart);
		},
		onError: (error) => {
			console.error(error);
		},
		onFinish: (message) => {
			console.log(message);
		},
		onToolCall: (toolCall) => {
			console.log(toolCall);
		}
		//	messages: initialMessages
	});

	let input = $state('');
	let files = $state<File[]>([]);
	let uploadInputRef: HTMLInputElement | undefined = $state();

	function handleSubmit() {
		if (input.trim() || files.length > 0) {
			chat.sendMessage({
				role: 'user',
				parts: [
					...files.map((file) => ({
						type: 'file' as const,
						url: URL.createObjectURL(file),
						name: file.name,
						mediaType: file.type
					})),
					{ type: 'text', text: input || 'Sent with attachments' }
				]
			});

			input = '';
			files = [];
			if (uploadInputRef) {
				uploadInputRef.value = '';
			}
		}
	}

	function handleValueChange(value: string) {
		input = value;
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const newFiles = Array.from(target.files);
			files = [...files, ...newFiles];
		}
	}

	function handleRemoveFile(index: number) {
		files = files.filter((_, i) => i !== index);
		if (uploadInputRef) {
			uploadInputRef.value = '';
		}
	}

	function handleRegenerate() {
		// TODO: Implement regeneration
		chat.regenerate?.();
	}

	$inspect(chat.status);
</script>

<div class="flex h-full max-h-screen flex-col pb-10">
	<Conversation class="h-full max-h-full">
		<ConversationContent>
			{#each chat.messages as message, messageIndex (message.id)}
				<div class="mx-auto max-w-(--breakpoint-sm)">
					{#if message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0}
						<Sources>
							<SourcesTrigger
								count={message.parts.filter((part) => part.type === 'source-url').length}
							/>
							{#each message.parts.filter((part) => part.type === 'source-url') as part, i}
								<SourcesContent>
									<Source
										href={(part as { url: string }).url}
										title={(part as { url: string }).url}
									/>
								</SourcesContent>
							{/each}
						</Sources>
					{/if}

					{#each message.parts as part, i}
						{#key `${message.id}-${i}`}
							{#if part.type === 'text'}
								{@const textContent = (part as { text: string }).text}
								<Message from={message.role} class="group">
									<MessageContent>
										<Response content={textContent} />
									</MessageContent>
									{#if message.role === 'assistant' && i === message.parts.length - 1}
										<Actions
											class={{
												'opacity-0 transition-opacity': true,
												'group-hover:opacity-100':
													// is last message and streaming
													message.id === chat.messages[chat.messages.length - 1]?.id
														? chat.status !== 'streaming'
														: true
											}}
										>
											<Action
												onclick={() => {
													const previousMessage = chat.messages[messageIndex - 1];

													chat.regenerate({
														messageId: previousMessage.id
													});
												}}
												label="Retry"
											>
												<RefreshCcwIcon class="size-3" />
											</Action>
											<Action
												onclick={() => navigator.clipboard.writeText(textContent)}
												label="Copy"
											>
												<CopyIcon class="size-3" />
											</Action>
										</Actions>
									{/if}
								</Message>
							{:else if part.type === 'reasoning'}
								{@const reasoningText = (part as { text: string }).text}
								<Reasoning
									class="w-full"
									isStreaming={chat.status === 'streaming' &&
										i === message.parts.length - 1 &&
										message.id === chat.messages[chat.messages.length - 1]?.id}
								>
									<ReasoningTrigger />
									<ReasoningContent class="" content={reasoningText} />
								</Reasoning>
							{/if}
						{/key}
					{/each}
				</div>
			{/each}

			{#if chat.status === 'submitted'}
				<Loader />
			{/if}
		</ConversationContent>
	</Conversation>
	<PromptInput
		value={input}
		onValueChange={handleValueChange}
		isLoading={chat.isLoading}
		onSubmit={handleSubmit}
		class="mx-auto mt-auto w-full max-w-(--breakpoint-sm)"
	>
		{#if files.length > 0}
			<div class="flex flex-wrap gap-2 pb-2">
				{#each files as file, index}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
						onclick={(e) => e.stopPropagation()}
					>
						<Paperclip class="size-4" />
						<span class="max-w-[120px] truncate">{file.name}</span>
						<button
							onclick={() => handleRemoveFile(index)}
							class="rounded-full p-1 hover:bg-secondary/50"
						>
							<X class="size-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
		<PromptInputTextarea placeholder="Ask me anything (or use @agent or /tool)" />
		<PromptInputActions class="flex items-center justify-between gap-2 pt-2">
			<PromptInputAction>
				{#snippet tooltip()}
					Attach files
				{/snippet}
				<label
					for="file-upload"
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl hover:bg-secondary-foreground/10"
				>
					<input
						type="file"
						multiple
						onchange={handleFileChange}
						class="hidden"
						id="file-upload"
						bind:this={uploadInputRef}
					/>
					<Paperclip class="size-5 text-primary" />
				</label>
			</PromptInputAction>
		</PromptInputActions>
	</PromptInput>
</div>
