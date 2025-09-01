<script lang="ts">
	import type { Chat } from '@ai-sdk/svelte';
	import type { ChatMessage } from '$lib/types';

	let {
		chat,
		messages
	}: {
		chat: Chat;
		messages: ChatMessage[];
	} = $props();
</script>
