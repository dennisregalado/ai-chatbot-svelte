<script lang="ts">
	import Chat from '$components/chat.svelte';

	let { data, params } = $props();
	let { chat, uiMessages } = $derived(data);
</script>

<Chat id={chat.id} messages={uiMessages} />
