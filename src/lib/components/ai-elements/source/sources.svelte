<script lang="ts">
	import { Collapsible } from '$lib/components/ui/collapsible';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		children: Snippet;
		className?: ClassValue;
		[key: string]: any;
	}

	let { children, className, ...restProps }: Props = $props();
</script>

<Collapsible class={cn('not-prose mb-4 text-xs text-primary', className)} {...restProps}>
	{@render children()}
</Collapsible>
