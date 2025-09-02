<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { CollapsibleContent } from '$lib/components/ui/collapsible';
	import Response from '../response/response.svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		class?: string;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<CollapsibleContent
	class={cn(
		'mt-4 text-sm',
		'text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2',
		className
	)}
	{...restProps}
>
	<Response class="grid gap-2">{children}</Response>
</CollapsibleContent>
