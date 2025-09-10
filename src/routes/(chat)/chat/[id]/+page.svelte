<script lang="ts">
	import Chat from '$components/chat.svelte';

	let { data } = $props();
	let { readonly, chat, uiMessages } = $derived(data);
</script>

<Chat
	id={chat.id}
	messages={uiMessages}
	visibility={chat.visibility}
	{readonly}
	autoResume
/>
<!-- <DataStreamHandler {id} /> -->
