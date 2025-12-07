<script lang="ts">
	import { Agent } from '$lib/agents/index.svelte';
	import { AgentChat } from '$lib/agents/ai.svelte';
	import {
		Conversation,
		ConversationContent,
		ConversationScrollButton
	} from '$lib/components/ai-elements/conversation/index.js';
	import {
		Reasoning,
		ReasoningTrigger,
		ReasoningContent
	} from '$lib/components/ai-elements/reasoning';
	import { untrack } from 'svelte';
	import MicIcon from '@lucide/svelte/icons/mic';
	import * as UnderlineTabs from '$lib/components/ui/underline-tabs';

	import {
		PromptInput,
		PromptInputBody,
		PromptInputAttachments,
		PromptInputAttachment,
		PromptInputTextarea,
		PromptInputToolbar,
		PromptInputTools,
		PromptInputActionMenu,
		PromptInputActionMenuTrigger,
		PromptInputActionMenuContent,
		PromptInputActionAddAttachments,
		PromptInputButton,
		PromptInputSubmit
	} from '$lib/components/ai-elements/prompt-input';
	import { PlusIcon } from '@lucide/svelte';
	import HistoryIcon from '@lucide/svelte/icons/history';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import Spinner from './ui/spinner/spinner.svelte';
	import {
		Message,
		MessageContent,
		MessageResponse,
		MessageActions,
		MessageAction,
		MessageToolbar
	} from '$lib/components/ai-elements/new-message';
	import Copy from '@lucide/svelte/icons/copy';
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import Check from '@lucide/svelte/icons/check';
	import { MessageAttachments, MessageAttachment } from '$lib/components/ai-elements/new-message';

	let { id = '', messages: initialMessages = [] } = $props();

	// Connect to the chat agent
	// Dev: Vite proxies /agents/* to Workers (see vite.config.ts)
	// Prod: Uses window.location.host (deploy to same domain as Workers)
	const agent = new Agent({
		agent: 'chat'
	});

	// Use the AgentChat class with the agent connection
	const chat = new AgentChat({
		agent,
		messages: untrack(() => initialMessages),
		onData: (dataPart) => {
			console.log('onData', dataPart);
		},
		onError: (error) => {
			console.error('onError', error);
		},
		onFinish: (message) => {
			console.log('onFinish', message);
		},
		onToolCall: (toolCall) => {
			console.log('onToolCall', toolCall);
		}
	});

	let text = $state<string>('');
	let useMicrophone = $state<boolean>(false);
	let files = $state<File[]>([]);
	let uploadInputRef: HTMLInputElement | undefined = $state();

	function handleSubmit() {
		if (text.trim() || files.length > 0) {
			//	replaceState(page.params.workspace + '/chat/' + id, {});
			chat.sendMessage({
				role: 'user',
				parts: [
					...files.map((file) => ({
						type: 'file' as const,
						url: URL.createObjectURL(file),
						name: file.name,
						mediaType: file.type
					})),
					{ type: 'text', text: text || 'Sent with attachments' }
				]
			});

			text = '';
			files = [];
			if (uploadInputRef) {
				uploadInputRef.value = '';
			}
		}
	}
</script>

<div class="flex h-full max-h-screen flex-col pb-9 relative">
	<Conversation class="h-full max-h-full">
		<ConversationContent>
			{#each chat.messages as message, messageIndex (message.id)}
				<Message
					from={message.role}
					class={{
						'mx-auto max-w-(--breakpoint-sm) py-1.5 group': true,
						'pb-20 min-h-[max(200px,30cqh)]': messageIndex === chat.messages.length - 1
					}}
				>
					{#if message.role === 'user' && message.parts.filter((part) => part.type === 'file').length > 0}
						<MessageAttachments>
							<MessageAttachment
								data={{
									type: 'file',
									url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop',
									mediaType: 'image/jpeg',
									filename: 'svelte-5-runes-demo.jpg'
								}}
							/>
							<MessageAttachment
								data={{
									type: 'file',
									url: '',
									mediaType: 'application/pdf',
									filename: 'component-architecture.pdf'
								}}
							/>
							<MessageAttachment
								data={{
									type: 'file',
									url: '',
									mediaType: 'text/plain',
									filename: 'notes.txt'
								}}
							/>
						</MessageAttachments>
					{/if}
					<MessageContent class="peer ">
						{#each message.parts as part, i (i)}
							{#if part.type === 'text'}
								<MessageResponse
									animation={{
										enabled: true,
										type: 'fade'
									}}
									content={part.text}
								/>
							{:else if part.type === 'reasoning'}
								<Reasoning
									class="w-full"
									isStreaming={chat.status === 'streaming' &&
										i === message.parts.length - 1 &&
										message.id === chat.messages.at(-1)?.id}
								>
									<ReasoningTrigger />
									<ReasoningContent>{part.text}</ReasoningContent>
								</Reasoning>
							{/if}
						{/each}
					</MessageContent>
					{#if message.role === 'assistant'}
						<UnderlineTabs.Root
							class="group-hover:opacity-100 opacity-0 transition-opacity ease-out duration-200"
						>
							<UnderlineTabs.List class="gap-1 h-7">
								<UnderlineTabs.Trigger
									class="p-0 size-7"
									value="response"
									onclick={() =>
										chat.regenerate({
											messageId: message.id
										})}
								>
									<RefreshCcw />
								</UnderlineTabs.Trigger>
								<UnderlineTabs.Trigger class="p-0 size-7" value="upvotes">
									<ThumbsUp />
								</UnderlineTabs.Trigger>
								<UnderlineTabs.Trigger class="p-0 size-7" value="downvotes">
									<ThumbsDown />
								</UnderlineTabs.Trigger>
								<UnderlineTabs.Trigger
									class="p-0 size-7"
									value="copy"
									onclick={() => {
										navigator.clipboard.writeText(message.content || '');
									}}
								>
									<Copy />
								</UnderlineTabs.Trigger>
							</UnderlineTabs.List>
						</UnderlineTabs.Root>
					{/if}
				</Message>
			{/each}

			{#if chat.status === 'submitted'}
				<div class="mx-auto max-w-(--breakpoint-sm)">
					<Spinner />
				</div>
			{/if}
		</ConversationContent>
		<ConversationScrollButton />
	</Conversation>
	<PromptInput onSubmit={handleSubmit} class="max-w-2xl mx-auto" globalDrop multiple>
		<PromptInputBody>
			<PromptInputAttachments>
				{#snippet children(attachment)}
					<PromptInputAttachment data={attachment} />
				{/snippet}
			</PromptInputAttachments>
			<PromptInputTextarea
				bind:value={text}
				onchange={(e) => (text = (e.target as HTMLTextAreaElement).value)}
			/>
		</PromptInputBody>
		<PromptInputToolbar>
			<UnderlineTabs.Root>
				<UnderlineTabs.List class="gap-1 h-8">
					<UnderlineTabs.Trigger class="p-0 size-8" value="attachments">
						<PlusIcon />
					</UnderlineTabs.Trigger>
					<UnderlineTabs.Trigger class="p-0 size-8" value="history">
						<HistoryIcon />
					</UnderlineTabs.Trigger>
				</UnderlineTabs.List>
			</UnderlineTabs.Root>
			<UnderlineTabs.Root class="ml-auto pr-1.5">
				<UnderlineTabs.List class="gap-1 h-8">
					<UnderlineTabs.Trigger class="p-0 size-8 ml-auto" value="microphone">
						<MicIcon />
					</UnderlineTabs.Trigger>
				</UnderlineTabs.List>
			</UnderlineTabs.Root>
			<PromptInputSubmit status={chat.status} />
		</PromptInputToolbar>
	</PromptInput>
</div>
