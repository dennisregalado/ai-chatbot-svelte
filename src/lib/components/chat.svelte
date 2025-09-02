<script lang="ts">
	import { getChatHistory, getVotesByChatId, getChatVisibility } from '$remote/chat.remote';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { DefaultChatTransport } from 'ai';
	import { Chat } from '@ai-sdk/svelte';
	import { fetchWithErrorHandlers, generateUUID } from '$lib/utils';
	import type { VisibilityType } from '$components/visibility-selector.svelte';
	import { toast } from 'svelte-sonner';
	import { ChatSDKError } from '$lib/errors';
	import type { Attachment, ChatMessage } from '$lib/types';

	import {
		Conversation,
		ConversationContent,
		ConversationScrollButton
	} from '$components/ai-elements/conversation';
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
	import { GlobeIcon } from '$components/icons.svelte';
	import { Source, Sources, SourcesContent, SourcesTrigger } from '$components/ai-elements/source';
	import { Reasoning, ReasoningContent, ReasoningTrigger } from '$components/ai-elements/reasoning';
	import { Actions, Action } from '$components/ai-elements/actions';
	import { CopyIcon } from '$components/icons.svelte';
	import { Loader } from '$components/ai-elements/loader';

	const models = [
		{
			name: 'GPT 4o',
			value: 'openai/gpt-4o'
		},
		{
			name: 'Deepseek R1',
			value: 'deepseek/deepseek-r1'
		}
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
	let model = $state<string>(models[0].value);
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
							selectedChatModel: page.data.selectedModelId,
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

	// let votes = getVotesByChatId(id);

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		if (input.trim()) {
			chat.sendMessage(
				{ text: input },
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
</script>

<div class="relative mx-auto size-full h-screen max-w-4xl p-6">
	<div class="flex h-full flex-col">
		<Conversation class="h-full">
			<ConversationContent>
				{#each chat.messages as message, messageIndex (message.id)}
					<div>
						{#if message.role === 'assistant'}
							<Sources>
								<SourcesTrigger
									count={message.parts.filter((part) => part.type === 'source-url').length}
								/>
								{#each message.parts.filter((part) => part.type === 'source-url') as part, i}
									{#key `${message.id}-${i}`}
										<SourcesContent>
											<Source href={part.url} title={part.url} />
										</SourcesContent>
									{/key}
								{/each}
							</Sources>
						{/if}
						{#key message.id}
							<Message from={message.role}>
								<MessageContent>
									{#each message.parts as part, i}
										{#key `${message.id}-${i}`}
											{#if part.type === 'text'}
												{@const isLastMessage = messageIndex === chat.messages.length - 1}
												<Response>
													{part.text}
												</Response>
												{#if message.role == 'assistant' && isLastMessage}
													<Actions class="mt-2">
														<Action onclick={() => chat.regenerate()} label="Retry">
															{@render CopyIcon(3)}
														</Action>
														<Action
															onclick={() => navigator.clipboard.writeText(part.text)}
															label="Copy"
														>
															{@render CopyIcon(3)}
														</Action>
													</Actions>
												{/if}
											{:else if part.type === 'reasoning'}
												<Reasoning class="w-full" isStreaming={chat.status === 'streaming'}>
													<ReasoningTrigger />
													<ReasoningContent>{part.text}</ReasoningContent>
												</Reasoning>
											{/if}
										{/key}
									{/each}
								</MessageContent>
							</Message>
						{/key}
					</div>
				{/each}
				{#if chat.status === 'submitted'}
					<Loader />
				{/if}
			</ConversationContent>
			<ConversationScrollButton />
		</Conversation>
		<PromptInput onsubmit={handleSubmit} class="mt-4">
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
					<PromptInputModelSelect
						onvaluechange={(value: string) => {
							model = value;
						}}
						value={model}
					>
						<PromptInputModelSelectTrigger>
							<PromptInputModelSelectValue />
						</PromptInputModelSelectTrigger>
						<PromptInputModelSelectContent>
							{#each models as model (model.value)}
								<PromptInputModelSelectItem value={model.value}>
									{model.name}
								</PromptInputModelSelectItem>
							{/each}
						</PromptInputModelSelectContent>
					</PromptInputModelSelect>
				</PromptInputTools>
				<PromptInputSubmit disabled={!input} status={chat.status} />
			</PromptInputToolbar>
		</PromptInput>
	</div>
</div>
