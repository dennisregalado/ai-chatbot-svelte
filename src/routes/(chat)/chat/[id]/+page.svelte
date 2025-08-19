<script lang="ts">
	import Chat from '$components/chat.svelte';

	let { data } = $props();
	let { session, chat, uiMessages } = $derived(data);
</script>

<Chat
	id={chat.id}
	initialMessages={uiMessages}
	initialVisibilityType={chat.visibility}
	readonly={session?.userId !== chat.userId}
	autoResume
/>
<!-- <DataStreamHandler {id} /> -->
