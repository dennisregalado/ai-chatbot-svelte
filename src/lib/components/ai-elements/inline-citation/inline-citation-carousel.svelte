<script lang="ts">
	import { Carousel } from '$lib/components/ui/carousel';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setCarouselApi } from './inline-citation-carousel-context.svelte.js';

	type Props = {
		setApi?: (api: CarouselAPI | undefined) => void;
	} & WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let { setApi, ref = $bindable(null), class: className, children, ...restProps }: Props = $props();

	function handleSetApi(api: CarouselAPI | undefined) {
		setCarouselApi(api);
		setApi?.(api);
	}
</script>

<Carousel bind:ref class={cn('w-full', className)} setApi={handleSetApi} {...restProps}>
	{@render children?.()}
</Carousel>
