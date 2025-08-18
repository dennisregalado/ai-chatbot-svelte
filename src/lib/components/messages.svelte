<script lang="ts">
	import ThinkingMessage from './messages/thinking-message.svelte';
	import Overview from './messages/overview.svelte';
	import { onMount } from 'svelte';
	import PreviewMessage from './messages/preview-message.svelte';
	import type { UIMessage } from '@ai-sdk/svelte';
	import type { Chat } from '@ai-sdk/svelte';
	import type { Vote } from '$server/db/schema';

	let containerRef = $state<HTMLDivElement | null>(null);
	let endRef = $state<HTMLDivElement | null>(null);

	let {
		chatId,
		status,
		votes,
		readonly,
		messages
	}: {
		chatId: string;
		status: Chat['status'];
		votes: Array<Vote> | undefined;
		messages: Chat['messages'];
		regenerate: Chat['regenerate'];
		readonly: boolean;
		isArtifactVisible: boolean;
	} = $props();
</script>
