<script lang="ts">
	import { CollapsibleTrigger } from '$lib/components/ui/collapsible';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		count: number;
		children?: Snippet;
		className?: ClassValue;
		[key: string]: any;
	}

	let { count, children, className, ...restProps }: Props = $props();
</script>

<CollapsibleTrigger class="flex items-center gap-2" {...restProps}>
	{#if children}
		{@render children()}
	{:else}
		<p class="font-medium">Used {count} sources</p>
		<ChevronDownIcon class="h-4 w-4" />
	{/if}
</CollapsibleTrigger>
