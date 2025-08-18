<script lang="ts">
	import Chat from '$components/chat.svelte';
	
	import { convertToUIMessages } from '$lib/utils';
	import { getChatById, getMessagesByChatId } from '$remote/chat.remote';
	import { getSession } from '$remote/auth.remote';

	let { params } = $props();

	const chat = $derived(await getChatById(params.id));
	const session = $derived(await getSession()); 
	const messagesFromDb = $derived(await getMessagesByChatId(params.id));

	const uiMessages = $derived(convertToUIMessages(messagesFromDb));
</script>

<Chat
	id={chat.id}
	initialMessages={uiMessages}
	initialVisibilityType={chat.visibility}
	readonly={session?.userId !== chat.userId}
	autoResume
/>
<!-- <DataStreamHandler {id} /> -->
