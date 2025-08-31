<script lang="ts">
	import { CollapsibleContent } from '$lib/components/ui/collapsible';
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

<CollapsibleContent
	class={cn(
		'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
		className
	)}
	{...restProps}
>
	<div class="mt-4 space-y-2 border-muted border-l-2 pl-4">
		{@render children()}
	</div>
</CollapsibleContent>
