<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import { getCarouselApi } from './inline-citation-carousel-context.svelte.js';

	type Props = WithElementRef<HTMLAttributes<HTMLButtonElement>>;

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: Props = $props();

	const api = getCarouselApi();

	function handleClick() {
		api?.scrollPrev();
	}
</script>

<button
	bind:this={ref}
	aria-label="Previous"
	class={cn('shrink-0', className)}
	onclick={handleClick}
	type="button"
	{...restProps}
>
	<ArrowLeftIcon class="size-4 text-muted-foreground" />
</button>
