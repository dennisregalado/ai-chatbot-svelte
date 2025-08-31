<script lang="ts">
	import { HoverCard } from '$lib/components/ui/hover-card';

	type Props = {
		closeDelay?: number;
		openDelay?: number;
		children?: import('svelte').Snippet;
	};

	let {
		closeDelay = 0,
		openDelay = 0,
		children
	}: Props = $props();
</script>

<HoverCard {closeDelay} {openDelay}>
	{@render children?.()}
</HoverCard>
