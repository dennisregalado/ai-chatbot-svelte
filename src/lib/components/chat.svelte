<script lang="ts">
	import type { Attachment } from 'ai';
	import { toast } from 'svelte-sonner';
	// import { ChatHistory } from '$hooks/example';
	import ChatHeader from './chat-header.svelte';
	import type { Chat as DbChat, User } from '$server/db/schema';
	import Messages from './messages.svelte';
	import MultimodalInput from './multimodal-input.svelte';
	import type { UIMessage } from '@ai-sdk/svelte';
	import type { Session } from '@auth/sveltekit';

	// refactor
	import { Chat } from '@ai-sdk/svelte';

	import { useDataStream } from '$components/data-stream-provider.svelte';
	import { generateUUID } from '$lib/utils';
	import type { ChatMessage } from '$lib/types';

	let {
		id,
		initialMessages,
		initialChatModel,
		initialVisibilityType,
		readonly,
		session,
		autoResume
	}: {
		id: string;
		initialMessages: ChatMessage[];
		initialChatModel: string;
		initialVisibilityType: 'private' | 'public';
		readonly: boolean;
		session: Session | null;
		autoResume: boolean;
	} = $props();

	const { dataStream } = useDataStream();

	let input = $state('');

	//const chatHistory = ChatHistory.fromContext();

	const chatClient = $derived(
		new Chat({
			id,
			//	experimental_throttle: 100,
			generateId: generateUUID,

			// This way, the client is only recreated when the ID changes, allowing us to fully manage messages
			// clientside while still SSRing them on initial load or when we navigate to a different chat.

			sendExtraMessageFields: true,
			onFinish: async () => {
				//	await chatHistory.refetch();
			},
			onError: (error) => {
				try {
					// If there's an API error, its message will be JSON-formatted
					const jsonError = JSON.parse(error.message);
					console.log(jsonError);
					if (
						typeof jsonError === 'object' &&
						jsonError !== null &&
						'message' in jsonError &&
						typeof jsonError.message === 'string'
					) {
						toast.error(jsonError.message);
					} else {
						toast.error(error.message);
					}
				} catch {
					toast.error(error.message);
				}
			}
		})
	);

	$inspect(chatClient);

	let attachments = $state<Array<Attachment>>([]);
</script>

<div class="flex h-dvh min-w-0 flex-col bg-background">
	<ChatHeader
		chatId={id}
		selectedModelId={initialChatModel}
		selectedVisibilityType={initialVisibilityType}
		{readonly}
		{session}
	/>
	<Messages
		{readonly}
		loading={chatClient.status === 'streaming' || chatClient.status === 'submitted'}
		messages={chatClient.messages}
	/>

	<form class="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6">
		{#if !readonly}
			<!-- TODO -->
			<!-- <MultimodalInput {attachments} {user} {chatClient} class="flex-1" /> -->
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
