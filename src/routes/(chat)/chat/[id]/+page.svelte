<script lang="ts">
	import Chat from '$components/chat.svelte';
	
	import { convertToUIMessages } from '$lib/utils';
	import { getChatById, getMessagesByChatId } from '$remote/chat.remote';
	import { getSession } from '$remote/auth.remote';

	let { params } = $props();

	const chat = await getChatById(params.id)
	const session = await getSession()
	const messagesFromDb = await getMessagesByChatId(params.id)
	const uiMessages = $derived(convertToUIMessages(messagesFromDb));

	$inspect({
		chat,
		session,
		messagesFromDb,
		uiMessages
	});
</script>

<Chat
	id={chat.id}
	initialMessages={uiMessages}
	initialVisibilityType={chat.visibility}
	readonly={session?.userId !== chat.userId}
	autoResume
/>
<!-- <DataStreamHandler {id} /> -->
