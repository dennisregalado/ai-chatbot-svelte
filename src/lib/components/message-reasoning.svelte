<script lang="ts">
	import LoaderIcon from './icons/loader.svelte';
	import ChevronDownIcon from './icons/chevron-down.svelte';
	import Markdown from './markdown.svelte';
	import { slide } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	let { loading, reasoning }: { loading: boolean; reasoning: string } = $props();
	let expanded = $state(false);
</script>

<div class="flex flex-col">
	{#if loading}
		<div class="flex flex-row items-center gap-2">
			<div class="font-medium">Reasoning</div>
			<div class="animate-spin">
				<LoaderIcon />
			</div>
		</div>
	{:else}
		<div class="flex flex-row items-center gap-2">
			<div class="font-medium">Reasoned for a few seconds</div>
			<button
				type="button"
				class="cursor-pointer"
				onclick={() => {
					expanded = !expanded;
				}}
			>
				<ChevronDownIcon />
			</button>
		</div>
	{/if}

	{#if expanded}
		<div
			transition:slide={{ duration: 200, easing: cubicInOut }}
			class="flex flex-col gap-4 border-l pl-4 text-zinc-600 dark:text-zinc-400"
		>
			<Markdown md={reasoning} />
		</div>
	{/if}
</div>
