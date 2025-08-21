<script lang="ts">
	import Chat from '$components/chat.svelte';

	let { data } = $props();
	let { readonly, chat, uiMessages } = $derived(data);
</script>

<Chat
	id={chat.id}
	initialMessages={uiMessages}
	initialVisibilityType={chat.visibility}
	{readonly}
	autoResume
/>
<!-- <DataStreamHandler {id} /> -->
