<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { getCarouselApi } from './inline-citation-carousel-context.svelte.js';

	type Props = WithElementRef<HTMLAttributes<HTMLButtonElement>>;

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: Props = $props();

	const api = getCarouselApi();

	function handleClick() {
		api?.scrollNext();
	}
</script>

<button
	bind:this={ref}
	aria-label="Next"
	class={cn('shrink-0', className)}
	onclick={handleClick}
	type="button"
	{...restProps}
>
	<ArrowRightIcon class="size-4 text-muted-foreground" />
</button>
