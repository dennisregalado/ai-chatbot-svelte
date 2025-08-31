<script lang="ts">
	import { CarouselContent } from '$lib/components/ui/carousel';
	import type { WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let {
		ref = $bindable(null),
		children,
		...restProps
	}: Props = $props();
</script>

<CarouselContent bind:ref {...restProps}>
	{@render children?.()}
</CarouselContent>
