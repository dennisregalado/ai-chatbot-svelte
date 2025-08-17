<script lang="ts">
	import Chat from '$components/chat.svelte';
	import { convertToUIMessages } from '$lib/utils';
	import { getMessagesByChatId } from '$remote/chat.remote';
	import { DEFAULT_CHAT_MODEL } from '$ai/models';

	let { params, data } = $props();
	let { chat, chatModelFromCookie, session } = $derived(data);

	const messagesFromDb = await getMessagesByChatId(params.id);
	const uiMessages = convertToUIMessages(messagesFromDb);
</script>

{#if !chatModelFromCookie}
	{#key params.id}
		<Chat
			id={chat.id}
			initialMessages={uiMessages}
			initialChatModel={DEFAULT_CHAT_MODEL}
			initialVisibilityType={chat.visibility}
			readonly={session?.userId !== chat.userId}
			{session}
			autoResume={true}
		/>
		<!-- <DataStreamHandler {id} /> -->
	{/key}
{:else}
	{#key params.id}
		<Chat
			id={chat.id}
			initialMessages={uiMessages}
			initialChatModel={chatModelFromCookie}
			initialVisibilityType={chat.visibility}
			readonly={session?.userId !== chat.userId}
			{session}
			autoResume={true}
		/>
		<!-- <DataStreamHandler {id} /> -->
	{/key}
{/if}
