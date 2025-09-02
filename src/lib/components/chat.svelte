<script lang="ts">
	import {
		getChatHistory,
		getVotesByChatId,
		getChatVisibility,
		deleteTrailingMessages
	} from '$remote/chat.remote';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { DefaultChatTransport } from 'ai';
	import { Chat } from '@ai-sdk/svelte';
	import { fetchWithErrorHandlers, generateUUID } from '$lib/utils';
	import type { VisibilityType } from '$components/visibility-selector.svelte';
	import { toast } from 'svelte-sonner';
	import { ChatSDKError } from '$lib/errors';
	import type { ChatMessage } from '$lib/types';
	import { Conversation, ConversationScrollButton } from '$components/ai-elements/conversation';
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
	import { Response } from '$components/ai-elements/response';
	import { GlobeIcon, PencilEditIcon } from '$components/icons.svelte';
	import { Source, Sources, SourcesContent, SourcesTrigger } from '$components/ai-elements/source';
	import { Reasoning, ReasoningContent, ReasoningTrigger } from '$components/ai-elements/reasoning';
	import { Actions, Action } from '$components/ai-elements/actions';
	import { CopyIcon, RetryIcon } from '$components/icons.svelte';
	import { Loader } from '$components/ai-elements/loader';
	import { Suggestions, Suggestion } from '$components/ai-elements/suggestion';
	import { chatModels } from '$ai/models';
	import { updateVoteByChatId } from '$remote/chat.remote';
	import { ThumbDownIcon, ThumbUpIcon } from '$components/icons.svelte';
	import Greeting from '$components/greeting.svelte';

	const suggestions = [
		'What is the UAP Disclosure Act of 2025?',
		'What is the weather in Tokyo?',
		'How do I make a really good fish taco?'
	];

	let {
		id,
		initialMessages = [],
		initialVisibilityType = 'private',
		readonly = false,
		autoResume
	}: {
		id: string;
		initialMessages?: ChatMessage[];
		initialVisibilityType?: VisibilityType;
		readonly?: boolean;
		autoResume?: boolean;
	} = $props();

	// const { setDataStream } = useDataStream();

	let input = $state('');
	let model = $state<string>(chatModels[0].id);
	let webSearch = $state(false);

	let visibilityType = getChatVisibility(id);

	const chat = $derived(
		new Chat({
			id,
			messages: initialMessages,
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
							selectedVisibilityType: visibilityType?.current || initialVisibilityType,
							...body
						}
					};
				}
			}),
			onData: (dataPart) => {
				console.log('dataPart', dataPart);
				//	setDataStream((ds) => [...ds, dataPart]);
			},
			onFinish: async () => {
				getChatHistory().refresh();
			},
			onError: (error) => {
				if (error instanceof ChatSDKError) {
					toast.error(error.message);
				}
			}
		})
	);

	let editing = $state(false);
	let searchParams = $derived(page.url.searchParams);
	let query = $derived(searchParams.get('query'));

	let hasAppendedQuery = $state(false);

	$effect(() => {
		if (query && !hasAppendedQuery) {
			chat.sendMessage({
				role: 'user' as const,
				parts: [{ type: 'text', text: query }]
			});

			hasAppendedQuery = true;
			replaceState('/chat/' + id, {});
		}
	});

	let votes = getVotesByChatId(id);

	const handleSubmit = (e: Event) => {
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
						model: model,
						webSearch: webSearch
					}
				}
			);
			input = '';
		}
	};

	const handleSuggestionClick = (suggestion: string) => {
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
	};

	$inspect('TEST:', chat.messages);
</script>

<div class="relative mx-auto size-full h-screen max-w-4xl p-6">
	<div class="flex h-full flex-col">
		{#if chat.messages.length == 0}
			<Greeting />
		{:else}
			<Conversation class="h-full">
				{#snippet children()}
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
											<MessageContent>
												<Response md={part.text} />
											</MessageContent>
											{#if message.role == 'assistant' && isLastMessage && chat.status !== 'streaming'}
												<Actions>
													{#if !readonly}
														<Action
															onclick={async () => {
																// todo fix this
																const previousMessage = chat.messages[messageIndex - 1];
																if (!previousMessage) return;
																await deleteTrailingMessages({
																	id: previousMessage?.id
																});

																chat.regenerate({
																	messageId: previousMessage?.id
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
														{@const vote = votes.current?.find(
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
													{/if}
												</Actions>
											{/if}
											{#if message.role === 'user'}
												<Actions class="justify-end">
													<Action
														onclick={() => {
															editing = true;
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
											<Reasoning class="w-full" isstreaming={chat.status === 'streaming'}>
												<ReasoningTrigger />
												<ReasoningContent md={part.text} />
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
				{/snippet}
				{#snippet button()}
					<ConversationScrollButton />
				{/snippet}
			</Conversation>
		{/if}
		{#if !readonly}
			<Suggestions>
				{#each suggestions as suggestion (suggestion)}
					<Suggestion onclick={() => handleSuggestionClick(suggestion)} {suggestion} />
				{/each}
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
		{/if}
	</div>
</div>
