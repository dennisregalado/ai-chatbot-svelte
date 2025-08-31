<script lang="ts">
	import { CollapsibleTrigger } from '$lib/components/ui/collapsible';
	import { cn } from '$lib/utils';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import SearchIcon from '@lucide/svelte/icons/search';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		children?: Snippet;
		title?: string;
		className?: ClassValue;
		[key: string]: any;
	}

	let { children, title, className, ...restProps }: Props = $props();
</script>

<CollapsibleTrigger class={cn('group', className)} {...restProps}>
	{#if children}
		{@render children()}
	{:else}
		<div class="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
			<SearchIcon class="size-4" />
			<p class="text-sm">{title}</p>
			<ChevronDownIcon class="size-4 transition-transform group-data-[state=open]:rotate-180" />
		</div>
	{/if}
</CollapsibleTrigger>
