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
	import { dayjs } from 'svelte-time';

	// Helper to format date separators like "Today", "Yesterday", "Monday", "Last Saturday"
	function formatDateSeparator(date: Date | string): string {
		const d = dayjs(date);
		const now = dayjs();
		const diffDays = now.startOf('day').diff(d.startOf('day'), 'day');

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return d.format('dddd'); // "Monday", "Tuesday", etc.
		if (diffDays < 14) return `Last ${d.format('dddd')}`; // "Last Saturday"
		return d.format('MMMM D, YYYY'); // "December 6, 2025"
	}

	// Check if we should show a date separator between messages
	function shouldShowDateSeparator(
		currentMessage: { createdAt?: Date | string },
		previousMessage?: { createdAt?: Date | string }
	): boolean {
		if (!previousMessage) return true;
		if (!currentMessage.createdAt || !previousMessage.createdAt) return false;

		const current = dayjs(currentMessage.createdAt).startOf('day');
		const previous = dayjs(previousMessage.createdAt).startOf('day');
		return !current.isSame(previous);
	}

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
	import ChatHistory from './chat-history.svelte';
	import { goto, replaceState } from '$app/navigation';
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
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
	import CopyButton from '$lib/components/ui/copy-button/copy-button.svelte';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import Check from '@lucide/svelte/icons/check';
	import { MessageAttachments, MessageAttachment } from '$lib/components/ai-elements/new-message';
	import { Button } from '$components/ui/button';
	import TrashIcon from '@lucide/svelte/icons/trash';

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

	$inspect(chat.messages);
</script>

<section class="flex h-full max-h-screen flex-col pb-5 relative">
	<Conversation class="h-full max-h-full">
		<ConversationContent>
			{#each chat.messages as message, messageIndex (message.id)}
				{@const previousMessage = chat.messages[messageIndex - 1]}
				{@const showSeparator = shouldShowDateSeparator(message, previousMessage)}

				{#if showSeparator && message.createdAt}
					<div class="mx-auto max-w-(--breakpoint-sm) flex items-center gap-4 py-4">
						<div class="h-px flex-1 bg-border"></div>
						<span class="text-sm text-muted-foreground font-medium">
							{formatDateSeparator(message.createdAt)}
						</span>
						<div class="h-px flex-1 bg-border"></div>
					</div>
				{/if}

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
					<UnderlineTabs.Root
						class={{
							'group-hover:opacity-100 opacity-0 transition-opacity ease-out duration-200': true,
							'opacity-0!': chat.status === 'streaming',
							'ml-auto': message.role === 'user'
						}}
					>
						<UnderlineTabs.List class="gap-1 h-7">
							{#if message.role === 'assistant'}
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
							{/if}
							<CopyButton text={message.content} size="icon" variant="ghost" class="size-7"
							></CopyButton>
						</UnderlineTabs.List>
					</UnderlineTabs.Root>
				</Message>
			{/each}

			<!-- {#if chat.status === 'submitted'}
				<div class="mx-auto max-w-(--breakpoint-sm)">
					<Spinner />
				</div>
			{/if} -->
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
				<UnderlineTabs.List class="h-8">
					<UnderlineTabs.Trigger class="p-0 size-8" value="attachments">
						<PlusIcon />
					</UnderlineTabs.Trigger>
					{#if !page.route?.id?.includes('welcome')}
						<ChatHistory>
							{#snippet children({ toggle })}
								<UnderlineTabs.Trigger class="p-0 size-8" value="history" onclick={toggle}>
									<HistoryIcon />
								</UnderlineTabs.Trigger>
							{/snippet}
						</ChatHistory>
					{/if}
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
	<header class="absolute top-0 left-0 right-0 p-2.5 w-full flex items-center justify-between">
		<div class="flex items-center gap-2 ml-auto">
			<Button
				variant="ghost"
				size="sm"
				onclick={() => {
					chat.clearHistory();
				}}
			>
				<PlusIcon />
				New Chat
			</Button>
		</div>
	</header>
</section>
