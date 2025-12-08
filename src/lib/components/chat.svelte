<script lang="ts">
	import { Agent } from '$lib/agents/index.svelte';
	import { AgentChat } from '$lib/agents/ai.svelte';
	import { Conversation } from '$lib/components/ai-elements/conversation/index.js';
	import {
		Reasoning,
		ReasoningTrigger,
		ReasoningContent
	} from '$lib/components/ai-elements/reasoning';
	import { untrack } from 'svelte';
	import MicIcon from '@lucide/svelte/icons/mic';
	import * as UnderlineTabs from '$lib/components/ui/underline-tabs';
	import { Shimmer } from '$lib/components/ai-elements/shimmer';

	import {
		PromptInput,
		PromptInputBody,
		PromptInputAttachments,
		PromptInputAttachment,
		PromptInputTextarea,
		PromptInputToolbar,
		PromptInputSubmit
	} from '$lib/components/ai-elements/prompt-input';
	import { PlusIcon } from '@lucide/svelte';
	import HistoryIcon from '@lucide/svelte/icons/history';
	import ChatHistory from './chat-history.svelte';
	import { page } from '$app/state';
	import {
		Message,
		MessageContent,
		MessageResponse
	} from '$lib/components/ai-elements/new-message';
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
	import CopyButton from '$lib/components/ui/copy-button/copy-button.svelte';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import { MessageAttachments, MessageAttachment } from '$lib/components/ai-elements/new-message';
	import { Button } from '$components/ui/button';
	import type { UIMessage } from 'ai';
	import type { PromptInputMessage } from '$lib/components/ai-elements/prompt-input/attachments-context.svelte.js';

	type VoteType = 'upvote' | 'downvote';
	type MessageVotes = {
		userVote?: VoteType;
		upvotes?: number;
		downvotes?: number;
	};

	type SyncedState = {
		isThinking: boolean;
		currentAction: string;
	};

	type ChatMessage = UIMessage<{ createdAt: string }>;

	let { id = '', messages: initialMessages = [] }: { id?: string; messages?: ChatMessage[] } =
		$props();

	let syncedState = $state<SyncedState>({
		isThinking: false,
		currentAction: ''
	});
	// Connect to the chat agent
	// Dev: Vite proxies /agents/* to Workers (see vite.config.ts)
	// Prod: Uses window.location.host (deploy to same domain as Workers)
	const agent = new Agent<SyncedState>({
		name: 'test-agent',
		agent: 'chat',
		onStateUpdate: (state) => {
			console.log('onStateUpdate', state);
			syncedState = state;
		}
	});

	// Use the AgentChat class with the agent connection
	const chat = new AgentChat<SyncedState, ChatMessage>({
		agent,
		messages: untrack(() => initialMessages as ChatMessage[]),
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

	let useMicrophone = $state<boolean>(false);

	// Votes state
	let votes = $state<Record<string, MessageVotes>>({});

	function handleSubmit({ text, files }: PromptInputMessage, event: SubmitEvent) {
		console.log('handleSubmit', text, files);
		if (text?.trim() || (files && files.length > 0)) {
			//	replaceState(page.params.workspace + '/chat/' + id, {});
			chat.sendMessage({
				role: 'user',
				parts: [
					...(files?.map((file) => file) || []),
					{ type: 'text', text: text || 'Sent with attachments' }
				]
			});

			text = '';
			files = [];
		}
	}

	// Handle voting using the agent RPC calls
	async function handleVote(messageId: string, voteType: VoteType) {
		if (!agent) return;

		const currentVote = votes[messageId]?.userVote;

		try {
			// If clicking the same vote, remove it
			if (currentVote === voteType) {
				const result = (await agent.call('removeVote', [messageId])) as MessageVotes;
				votes = {
					...votes,
					[messageId]: result
				};
			} else {
				// Otherwise, set the new vote
				const result = (await agent.call('vote', [messageId, voteType])) as MessageVotes;
				votes = {
					...votes,
					[messageId]: result
				};
			}
		} catch (error) {
			console.error('Error voting:', error);
		}
	}

	// Load initial votes when agent connects
	$effect(() => {
		if (agent && chat.messages.length > 0) {
			agent
				.call('getAllVotes', [])
				.then((result) => {
					if (result) {
						votes = result as Record<string, MessageVotes>;
					}
				})
				.catch(() => {
					// Agent may not be ready yet, that's ok
				});
		}
	});

	$inspect(chat, agent);
</script>

<section class="flex h-full max-h-screen flex-col pb-5 relative">
	<Conversation class="h-full max-h-full">
		{#each chat.messages as message, messageIndex (message.id)}
			<Message
				from={message.role}
				class={{
					'mx-auto max-w-(--breakpoint-sm) py-1.5 group': true,
					'pb-20 min-h-[max(200px,30cqh)]': messageIndex === chat.messages.length - 1
				}}
			>
				<MessageContent class="peer">
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
				{#if message.role === 'user' && message.parts.filter((part) => part.type === 'file').length > 0}
					{@const fileParts = message.parts.filter((part) => part.type === 'file')}
					<MessageAttachments>
						{#each fileParts as filePart}
							<MessageAttachment data={filePart} />
						{/each}
					</MessageAttachments>
				{/if}
				<UnderlineTabs.Root
					hoverOnly
					class={{
						'opacity-0 transition-opacity ease-out duration-200': true,
						'group-hover:opacity-100': !(
							chat.status === 'streaming' && message.role === 'assistant'
						),
						'ml-auto': message.role === 'user'
					}}
				>
					<UnderlineTabs.List class="h-7">
						{#if message.role === 'assistant'}
							{@const messageVotes = votes[message.id]}

							<UnderlineTabs.Trigger
								class="p-0 size-7"
								value="upvotes"
								disabled={messageVotes?.userVote === 'upvote'}
								onclick={() => handleVote(message.id, 'upvote')}
							>
								<ThumbsUp />
							</UnderlineTabs.Trigger>
							<UnderlineTabs.Trigger
								class="p-0 size-7"
								value="downvotes"
								disabled={messageVotes?.userVote === 'downvote'}
								onclick={() => handleVote(message.id, 'downvote')}
							>
								<ThumbsDown />
							</UnderlineTabs.Trigger>
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
						{/if}
						<CopyButton
							text={message.parts.find((part) => part.type === 'text')?.text || ''}
							size="icon"
							variant="ghost"
							class="size-7"
						/>
					</UnderlineTabs.List>
				</UnderlineTabs.Root>
			</Message>
		{/each}
		{#if syncedState.currentAction}
			<Message from="assistant">
				<Shimmer content_length={syncedState.currentAction.length}>
					{#snippet children()}
						{syncedState.currentAction}
					{/snippet}
				</Shimmer>
			</Message>
		{/if}
	</Conversation>
	<PromptInput onSubmit={handleSubmit} class="max-w-2xl mx-auto" globalDrop multiple>
		<PromptInputBody>
			<PromptInputAttachments>
				{#snippet children(attachment)}
					<PromptInputAttachment data={attachment} />
				{/snippet}
			</PromptInputAttachments>
			<PromptInputTextarea placeholder="Ask anything..." />
		</PromptInputBody>
		<PromptInputToolbar>
			<UnderlineTabs.Root hoverOnly>
				<UnderlineTabs.List>
					<UnderlineTabs.Trigger class="text-sm" value="attachments">
						<PlusIcon />
					</UnderlineTabs.Trigger>
					{#if !page.route?.id?.includes('welcome')}
						<ChatHistory>
							{#snippet children({ toggle })}
								<UnderlineTabs.Trigger value="history" onclick={toggle}>
									<HistoryIcon />
								</UnderlineTabs.Trigger>
							{/snippet}
						</ChatHistory>
					{/if}
				</UnderlineTabs.List>
			</UnderlineTabs.Root>
			<UnderlineTabs.Root class="ml-auto pr-1.5">
				<UnderlineTabs.List>
					<UnderlineTabs.Trigger class="ml-auto" value="microphone">
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
