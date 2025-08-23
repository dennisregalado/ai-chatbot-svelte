<script lang="ts" module>
	export let lockScroll = $state(false);
</script>

<script lang="ts">
	import PreviewMessage, { thinkingMessage } from './message.svelte';
	import type { Chat } from '@ai-sdk/svelte';
	import type { Vote } from '$server/db/schema';
	import type { ChatMessage } from '$lib/types';
	import Greeting from './greeting.svelte';
	import { tick } from 'svelte';

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

	let containerRef = $state<HTMLDivElement | null>(null);
	let endRef = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!(containerRef && endRef)) return; 

		const observer = new MutationObserver(() => {
			if (!endRef) return;
			endRef.scrollIntoView({ behavior: 'instant', block: 'end' });
		});

		observer.observe(containerRef, {
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true
		});

		return () => observer.disconnect();
	});


	$effect.pre(() => {
		console.log('the component is about to update');
		tick().then(() => {
				console.log('the component just updated');
		});
	});
</script>

<div
	bind:this={containerRef}
	class="relative flex min-w-0 flex-1 flex-col gap-6 overflow-y-scroll pt-4"
>
	{#if messages.length === 0}
		<Greeting />
	{/if}
	{#each messages as message, index (message.id)}
		<PreviewMessage
			{chatId}
			{message}
			vote={votes ? votes.find((vote) => vote.messageId === message.id) : undefined}
			loading={status === 'streaming' && messages.length - 1 === index}
			{messages}
			{regenerate}
			{readonly}
			requiresScrollPadding={false}
		/>
	{/each}
	{#if status === 'submitted' && messages.length > 0 && messages[messages.length - 1].role === 'user'}
		{@render thinkingMessage()}
	{/if}
	<div bind:this={endRef} class="min-h-6 min-w-6 shrink-0"></div>
</div>
