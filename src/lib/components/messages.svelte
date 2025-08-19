<script lang="ts">
	import ThinkingMessage from './messages/thinking-message.svelte';
	import Overview from './messages/overview.svelte';
	import { onMount } from 'svelte';
	import PreviewMessage from './messages/preview-message.svelte';
	import type { UIMessage } from '@ai-sdk/svelte';
	import type { Chat } from '@ai-sdk/svelte';
	import type { Vote } from '$server/db/schema';
	import { fly } from 'svelte/transition';
	import Greeting from './greeting.svelte';

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

	let messagesEndRef = $state<HTMLDivElement | null>(null);
	let animate = $state(false); 

	onMount(() => {
		if (messages.length === 0) {
			// defer to next tick so Svelte sees a state change
			setTimeout(() => (animate = true), 0);
		}
	});
</script>

<div class="relative flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll pt-4">
	{#if animate}
		<Greeting />
	{/if}
	{#each messages as message, index (message.id)}{/each}
	{#if status === 'submitted' && messages.length > 0 && messages[messages.length - 1].role === 'user'}
		<ThinkingMessage />
	{/if}
	<div bind:this={messagesEndRef} class="min-h-[24px] min-w-[24px] shrink-0" />
</div>
