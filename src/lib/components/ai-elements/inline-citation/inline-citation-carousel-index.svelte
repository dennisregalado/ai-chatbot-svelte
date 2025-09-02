<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCarouselApi } from './inline-citation-carousel-context.svelte.js';

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let { ref = $bindable(null), class: className, children, ...restProps }: Props = $props();

	const api = getCarouselApi();
	let current = $state(0);
	let count = $state(0);

	$effect(() => {
		if (!api) return;

		count = api.scrollSnapList().length;
		current = api.selectedScrollSnap() + 1;

		const handleSelect = () => {
			current = api.selectedScrollSnap() + 1;
		};

		api.on('select', handleSelect);

		return () => {
			api.off('select', handleSelect);
		};
	});
</script>

<div
	bind:this={ref}
	class={cn(
		'flex flex-1 items-center justify-end px-3 py-1 text-xs text-muted-foreground',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{current}/{count}
	{/if}
</div>
