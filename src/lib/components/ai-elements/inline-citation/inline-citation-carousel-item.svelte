<script lang="ts">
	import { CarouselItem } from '$lib/components/ui/carousel';
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let { ref = $bindable(null), class: className, children, ...restProps }: Props = $props();
</script>

<CarouselItem bind:ref class={cn('w-full space-y-2 p-4 pl-8', className)} {...restProps}>
	{@render children?.()}
</CarouselItem>
