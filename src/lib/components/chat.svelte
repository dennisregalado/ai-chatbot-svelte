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
	import RefreshCcwIcon from '@lucide/svelte/icons/refresh-cw';
	import { untrack } from 'svelte';
	import MicIcon from '@lucide/svelte/icons/mic';
	import { CopyButton } from '$lib/components/ui/copy-button';
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

<div class="flex h-full max-h-screen flex-col pb-10 relative">
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
													const previousMessage = chat.messages[messageIndex];

													chat.regenerate();
												}}
												label="Retry"
											>
												<RefreshCcwIcon class="size-3" />
											</Action>
											<CopyButton text={textContent} />
										</Actions>
									{/if}
								</Message>
							{:else if part.type === 'reasoning'}
								{@const reasoningText = (part as { text: string }).text}
								<Reasoning
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
				<Spinner />
			{/if}
		</ConversationContent>
		<ConversationScrollButton />
	</Conversation>
	<PromptInput onSubmit={handleSubmit} globalDrop class="max-w-2xl mx-auto" multiple>
		<PromptInputBody class="border-none">
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
			<PromptInputTools>
				<!-- <PromptInputActionMenu>
					<PromptInputActionMenuTrigger />
					<PromptInputActionMenuContent>
						<PromptInputActionAddAttachments />
					</PromptInputActionMenuContent>
				</PromptInputActionMenu> -->
				<UnderlineTabs.Root>
					<UnderlineTabs.List>
						<UnderlineTabs.Trigger class="px-2" value={'attachments'}>
							<PlusIcon />
						</UnderlineTabs.Trigger>
						<UnderlineTabs.Trigger class="px-2" value={'history'}>
							<HistoryIcon />
						</UnderlineTabs.Trigger>
					</UnderlineTabs.List>
				</UnderlineTabs.Root>
			</PromptInputTools>
			<PromptInputTools>
				<PromptInputButton
					onclick={() => (useMicrophone = !useMicrophone)}
					variant={useMicrophone ? 'default' : 'ghost'}
				>
					<MicIcon size={16} />
					<span class="sr-only">Microphone</span>
				</PromptInputButton>
				<PromptInputSubmit status={chat?.status}></PromptInputSubmit>
			</PromptInputTools>
		</PromptInputToolbar>
	</PromptInput>
</div>
