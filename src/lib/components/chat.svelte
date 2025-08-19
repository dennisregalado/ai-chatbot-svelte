<script lang="ts">
	// refactor
	import { getChatHistory, getVotesByChatId, getChatVisibility } from '$remote/chat.remote';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';

	import { DefaultChatTransport } from 'ai';
	import { Chat } from '@ai-sdk/svelte';
	import ChatHeader from './chat-header.svelte';
	import { fetchWithErrorHandlers, generateUUID } from '$lib/utils';
	//	import { Artifact } from './artifact';
	import MultimodalInput from './multimodal-input.svelte';
	import Messages from './messages.svelte';
	import type { VisibilityType } from '$components/visibility-selector.svelte';
	//	import { useArtifactSelector } from '@/hooks/use-artifact';
	//	import { getChatHistoryPaginationKey } from './sidebar-history';
	import { toast } from 'svelte-sonner';
	//	import { useChatVisibility } from '@/hooks/use-chat-visibility';
	//	import { AutoResume } from '$hooks/auto-resume.svelte';
	import { ChatSDKError } from '$lib/errors';
	import type { Attachment, ChatMessage } from '$lib/types';
	//import { useDataStream } from '$components/data-stream-provider.svelte';

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

	let visibilityType = getChatVisibility(id);
 

	let input = $state('');

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

	// let votes = $derived(chat.messages.length >= 2 ? await getVotesByChatId(id) : []);

	let attachments = $state<Array<Attachment>>([]);
	//	const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
	let isArtifactVisible = $state(false);

	/* new AutoResume({
		autoResume,
		initialMessages,
		get chat() {
			return chat;
		}
	});*/
</script>

<div class="flex h-dvh min-w-0 flex-col bg-background">
	<ChatHeader chatId={id} {readonly} />
	<Messages
		chatId={id}
		status={chat.status}
		votes={[]}
		messages={chat.messages}
		regenerate={chat.regenerate}
		{readonly}
		{isArtifactVisible}
	/>
	<form class="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6">
		{#if !readonly}
			<MultimodalInput bind:input {chat} {attachments} />
		{/if}
	</form>
</div>

<!-- TODO -->
<!-- <Artifact
	chatId={id}
	{input}
	{setInput}
	{handleSubmit}
	{isLoading}
	{stop}
	{attachments}
	{setAttachments}
	{append}
	{messages}
	{setMessages}
	{reload}
	{votes}
	{readonly}
/> -->
