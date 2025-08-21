<script lang="ts">
	import { onMount } from 'svelte';
	import PreviewMessage, { thinkingMessage } from './message.svelte';
	import type { Chat } from '@ai-sdk/svelte';
	import type { Vote } from '$server/db/schema';
	import type { ChatMessage } from '$lib/types';
	import Greeting from './greeting.svelte';

	let containerRef = $state<HTMLDivElement | null>(null);
	let endRef = $state<HTMLDivElement | null>(null);

	let {
		chatId,
		status,
		votes,
		readonly,
		messages,
		regenerate
	}: {
		chatId: string;
		status: Chat['status'];
		votes: Array<Vote> | undefined;
		messages: ChatMessage[];
		regenerate: Chat['regenerate'];
		readonly: boolean;
		isArtifactVisible: boolean;
	} = $props();

	let messagesEndRef = $state<HTMLDivElement | null>(null);
	let animate = $state(false);

	onMount(() => {
		setTimeout(() => (animate = true), 0);
	});
</script>

<div class="relative flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll pt-4">
	{#if messages.length === 0}
		<Greeting />
	{/if}
	{#each messages as message, index (message.id)}
		<PreviewMessage
			{chatId}
			{message}
			vote={votes ? votes.find((vote) => vote.messageId === message.id) : undefined}
			loading={status === 'submitted'}
			{messages}
			{regenerate}
			{readonly}
			requiresScrollPadding={false}
		/>
	{/each}
	{#if status === 'submitted' && messages.length > 0 && messages[messages.length - 1].role === 'user'}
		{@render thinkingMessage()}
	{/if}
	<div bind:this={messagesEndRef} class="min-h-6 min-w-6 shrink-0"></div>
</div>
