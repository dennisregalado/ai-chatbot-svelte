<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { HoverCardTrigger } from '$lib/components/ui/hover-card';
	import { cn, type WithElementRef } from '$lib/utils';

	type Props = WithElementRef<{
		sources: string[];
		variant?: 'default' | 'secondary' | 'destructive' | 'outline';
		class?: string;
	}>;

	let {
		sources,
		variant = 'secondary',
		ref = $bindable(null),
		class: className
	}: Props = $props();
</script>

<HoverCardTrigger bind:ref>
	<Badge class={cn('ml-1 rounded-full', className)} {variant}>
		{#if sources.length}
			{new URL(sources[0]).hostname}
			{#if sources.length > 1}
				+{sources.length - 1}
			{/if}
		{:else}
			unknown
		{/if}
	</Badge>
</HoverCardTrigger>
