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
		'mt-3 flex w-fit flex-col gap-2',
		'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
		className
	)}
	{...restProps}
>
	{@render children()}
</CollapsibleContent>
