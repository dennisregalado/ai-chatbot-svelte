<script lang="ts">
	import Chat from '$components/chat.svelte';
	let { params } = $props();

	let id = $state<string>('welcome');
</script>

<Chat messages={[{ role: 'assistant', parts: [{ type: 'text', text: 'Welcome to the chat? How can I help you today?' }] }]} />
