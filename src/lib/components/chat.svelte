<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport } from 'ai';
	import { replaceState } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { chatModels } from '$ai/models';
	import { ChatSDKError } from '$lib/errors';
	import type { ChatMessage } from '$lib/types';
	import { cn, fetchWithErrorHandlers, generateUUID } from '$lib/utils';
	import type { VisibilityType } from '$components/visibility-selector.svelte';
	import {
		deleteTrailingMessages,
		getChatHistory,
		getVotesByChatId,
		updateVoteByChatId
	} from '$remote/chat.remote';
	import { Actions, Action } from '$components/ai-elements/actions';
	import { Conversation, ConversationScrollButton } from '$components/ai-elements/conversation';
	import { Loader } from '$components/ai-elements/loader';
	import { Message, MessageContent } from '$components/ai-elements/message';
	import {
		PromptInput,
		PromptInputButton,
		PromptInputModelSelect,
		PromptInputModelSelectContent,
		PromptInputModelSelectItem,
		PromptInputModelSelectTrigger,
		PromptInputModelSelectValue,
		PromptInputSubmit,
		PromptInputTextarea,
		PromptInputToolbar,
		PromptInputTools
	} from '$components/ai-elements/prompt-input';
	import { Reasoning, ReasoningContent, ReasoningTrigger } from '$components/ai-elements/reasoning';
	import { Response } from '$components/ai-elements/response';
	import { Source, Sources, SourcesContent, SourcesTrigger } from '$components/ai-elements/source';
	import { Suggestions, Suggestion } from '$components/ai-elements/suggestion';
	import {
		CopyIcon,
		GlobeIcon,
		PencilEditIcon,
		RetryIcon,
		ThumbDownIcon,
		ThumbUpIcon
	} from '$components/icons.svelte';
	import { untrack } from 'svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { page } from '$app/state';
	import { useDataStream } from '$components/data-stream-provider.svelte';
	import { AutoResume } from '$hooks/auto-resume.svelte';
	import { Button } from '$lib/components/ui/button';
	// Fallback suggestions shown when we have none streamed yet
	const fallbackSuggestions = [
		'What is the UAP Disclosure Act of 2025?',
		'What is the weather in Tokyo?',
		'How do I make a really good fish taco?'
	];

	// Live, streamed follow-up questions from the server
	let followups = $state<string[]>([]);

	let {
		id,
		messages: initialMessages = [],
		visibility: initialVisibilityType = 'private',
		readonly = false,
		autoResume = true
	}: {
		id: string;
		messages?: ChatMessage[];
		visibility?: VisibilityType;
		readonly?: boolean;
		autoResume?: boolean;
	} = $props();

	let user = page.data.user;

	const { setDataStream } = useDataStream();

	let input = $state('');
	let model = $state<string>(chatModels[0].id);
	let webSearch = $state(false);
	let chatTitle = $state('');

	const chat = $derived(
		new Chat({
			get id() {
				return id;
			},
			messages: untrack(() => initialMessages),
			// @ts-ignore
			experimental_throttle: 100,
			generateId: generateUUID,
			transport: new DefaultChatTransport({
				api: '/api/chat',
				fetch: fetchWithErrorHandlers,
				prepareSendMessagesRequest({ messages, id, body }) {
					return {
						body: {
							id,
							message: messages.at(-1),
							selectedChatModel: 'chat-model-reasoning',
							selectedVisibilityType: initialVisibilityType,
							...body
						}
					};
				}
			}),
			onData: (dataPart) => {
				// Refresh the chat history to update the title in the sidebar
				if (dataPart?.type === 'data-title') {
					chatTitle = dataPart.data;
					getChatHistory().refresh();
				}

				// Clear any previous follow-up suggestions when signaled
				if (dataPart?.type === 'data-clear') {
					followups = [];
				}

				// Append streamed follow-up questions as they arrive
				if (dataPart?.type === 'data-followup' && typeof dataPart.data === 'string') {
					// de-duplicate while preserving order
					if (!followups.includes(dataPart.data)) {
						followups = [...followups, dataPart.data];
					}
				}

				// If you later want to fan out to a shared data stream context:
				setDataStream((ds) => [...ds, dataPart]);
			},
			onError: (error) => {
				if (error instanceof ChatSDKError) {
					toast.error(error.message);
				}
			}
		})
	);

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (chat.status !== 'ready') return;
		if (input.trim()) {
			replaceState('/chat/' + id, {});
			chat.sendMessage(
				{
					role: 'user' as const,
					parts: [{ type: 'text', text: input }]
				},
				{
					body: {
						model,
						webSearch
					}
				}
			);
			input = '';
		}
	}

	function handleSuggestionClick(suggestion: string) {
		if (chat.status !== 'ready') return;

		replaceState('/chat/' + id, {});
		chat.sendMessage(
			{
				role: 'user' as const,
				parts: [{ type: 'text', text: suggestion }]
			},
			{
				body: {
					model: model,
					webSearch: webSearch
				}
			}
		);
	}

	new AutoResume({
		autoResume,
		initialMessages,
		get resumeStream() {
			return chat.resumeStream;
		}
	});
</script>

<div class="flex size-full flex-col items-center justify-center">
	<Conversation>
		{#each chat.messages as message, messageIndex (message.id)}
			{#if message.role === 'assistant'}
				{@const sources = message.parts.filter((part) => part.type === 'source-url')}
				{#if sources.length > 0}
					<Sources>
						<SourcesTrigger count={sources.length} />
						{#each sources as part, i}
							{#key `${message.id}-${i}`}
								<SourcesContent>
									<Source href={part.url} title={part.url} />
								</SourcesContent>
							{/key}
						{/each}
					</Sources>
				{/if}
			{/if}
			{#key message.id}
				<Message from={message.role}>
					{#each message.parts as part, i}
						{#key `${message.id}-${i}`}
							{#if part.type === 'text'}
								{@const isLastMessage = messageIndex === chat.messages.length - 1}
								{#if message.role === 'user'}
									<Avatar.Root class="size-4">
										<Avatar.Image
											src={user?.image || `https://avatar.vercel.sh/${user?.id}`}
											alt={user?.name}
										/>
									</Avatar.Root>
								{/if}
								<MessageContent
									class={cn(
										message.role === 'user' && 'rounded-sm bg-secondary! p-2.5 text-primary!'
									)}
								>
									<Response content={part.text} />
								</MessageContent>
								{#if message.role == 'assistant' && isLastMessage}
									<Actions>
										{#if !readonly}
											<Action
												onclick={async () => {
													const previousMessage = chat.messages[messageIndex - 1];

													await deleteTrailingMessages({
														id: previousMessage.id
													});

													chat.regenerate({
														messageId: previousMessage.id
													});
												}}
												tooltip="Retry"
												label="Retry"
											>
												{@render RetryIcon()}
											</Action>
										{/if}
										<Action
											onclick={() => {
												navigator.clipboard.writeText(part.text);
												toast.success('Copied to clipboard!');
											}}
											tooltip="Copy"
											label="Copy"
										>
											{@render CopyIcon()}
										</Action>
										{#if !readonly}
											<svelte:boundary>
												{#snippet pending()}
													<Action tooltip="Upvote" label="Upvote">
														{@render ThumbUpIcon()}
													</Action>
													<Action tooltip="Downvote" label="Downvote">
														{@render ThumbDownIcon()}
													</Action>
												{/snippet}
												{@const vote = (await getVotesByChatId(chat.id))?.find(
													(vote) => vote.messageId === message.id
												)}
												<Action
													disabled={vote && vote.isUpvoted}
													onclick={async () => {
														try {
															const upvote = updateVoteByChatId({
																chatId: chat.id,
																messageId: message.id,
																type: 'up'
															}).updates(
																getVotesByChatId(chat.id).withOverride((currentVotes) => {
																	if (!currentVotes) return [];

																	const votesWithoutCurrent = currentVotes.filter(
																		(vote) => vote.messageId !== message.id
																	);

																	return [
																		...votesWithoutCurrent,
																		{
																			chatId: chat.id,
																			messageId: message.id,
																			isUpvoted: true
																		}
																	];
																})
															);

															toast.promise(upvote, {
																loading: 'Upvoting Response...',
																success: 'Upvoted Response!',
																error: 'Failed to upvote response.'
															});
														} catch (error) {
															toast.error('Failed to upvote response.');
														}
													}}
													tooltip="Upvote"
													label="Upvote"
												>
													{@render ThumbUpIcon()}
												</Action>
												<Action
													disabled={vote && !vote.isUpvoted}
													onclick={async () => {
														try {
															const downvote = updateVoteByChatId({
																chatId: chat.id,
																messageId: message.id,
																type: 'down'
															}).updates(
																getVotesByChatId(chat.id).withOverride((currentVotes) => {
																	if (!currentVotes) return [];

																	const votesWithoutCurrent = currentVotes.filter(
																		(vote) => vote.messageId !== message.id
																	);

																	return [
																		...votesWithoutCurrent,
																		{
																			chatId: chat.id,
																			messageId: message.id,
																			isUpvoted: false
																		}
																	];
																})
															);

															toast.promise(downvote, {
																loading: 'Downvoting Response...',
																success: 'Downvoted Response!',
																error: 'Failed to downvote response.'
															});
														} catch (error) {
															toast.error('Failed to downvote response.');
														}
													}}
													tooltip="Downvote"
													label="Downvote"
												>
													{@render ThumbDownIcon()}
												</Action>
											</svelte:boundary>
										{/if}
									</Actions>
								{/if}
								{#if message.role === 'user'}
									<Actions class="justify-end">
										<Action
											onclick={() => {
												input = part.text;
											}}
											tooltip="Edit"
											label="Edit"
										>
											{@render PencilEditIcon()}
										</Action>
										<Action
											onclick={() => {
												navigator.clipboard.writeText(part.text);
												toast.success('Copied to clipboard!');
											}}
											tooltip="Copy"
											label="Copy"
										>
											{@render CopyIcon()}
										</Action>
									</Actions>
								{/if}
							{:else if part.type === 'reasoning'}
								<Reasoning
									class="w-full"
									isStreaming={chat.status === 'streaming' &&
										i === message.parts.length - 1 &&
										message.id === chat.messages.at(-1)?.id}
								>
									<ReasoningTrigger />
									<ReasoningContent content={part.text} />
								</Reasoning>
							{/if}
						{/key}
					{/each}
				</Message>
			{/key}
		{/each}
		{#if chat.status === 'submitted'}
			<Loader />
		{/if}
	</Conversation>
	{#if !readonly}
		<div class="mx-auto max-w-3xl pb-3">
			<Suggestions class="overflow-x-auto">
				{#if followups.length > 0}
					{#each followups as suggestion (suggestion)}
						<Suggestion onclick={() => handleSuggestionClick(suggestion)} {suggestion} />
					{/each}
				{:else}
					{#each fallbackSuggestions as suggestion (suggestion)}
						<Suggestion onclick={() => handleSuggestionClick(suggestion)} {suggestion} />
					{/each}
				{/if}
			</Suggestions>
			<PromptInput onsubmit={handleSubmit} class="mt-4 shrink-0">
				<PromptInputTextarea bind:value={input} />
				<PromptInputToolbar>
					<PromptInputTools>
						<PromptInputButton
							variant={webSearch ? 'default' : 'ghost'}
							onclick={() => (webSearch = !webSearch)}
						>
							{@render GlobeIcon(16)}
							<span>Search</span>
						</PromptInputButton>
						<PromptInputModelSelect>
							<PromptInputModelSelectTrigger>
								<PromptInputModelSelectValue>
									{chatModels.find((m) => m.id === model)?.name}
								</PromptInputModelSelectValue>
							</PromptInputModelSelectTrigger>
							<PromptInputModelSelectContent>
								{#each chatModels as chatModel (chatModel.id)}
									<PromptInputModelSelectItem
										value={chatModel.id}
										onSelect={() => (model = chatModel.id)}
									>
										{chatModel.name}
									</PromptInputModelSelectItem>
								{/each}
							</PromptInputModelSelectContent>
						</PromptInputModelSelect>
					</PromptInputTools>
					<PromptInputSubmit
						disabled={!input.trim()}
						status={chat.status === 'streaming' ? 'streaming' : 'ready'}
					/>
				</PromptInputToolbar>
			</PromptInput>
		</div>
	{/if}
</div>
