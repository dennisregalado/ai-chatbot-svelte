<script lang="ts">
	import Chat from '$components/chat.svelte';
	import { convertToUIMessages } from '$lib/utils';
	import { getChatById, getMessagesByChatId } from '$remote/chat.remote';
	

	let { params, data } = $props();

	const chat = $derived(await getChatById(params.id));

	let { chatModelFromCookie, session } = $derived(data);

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
