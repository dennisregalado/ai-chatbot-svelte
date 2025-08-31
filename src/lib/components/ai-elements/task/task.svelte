<script lang="ts">
	import { Collapsible } from '$lib/components/ui/collapsible';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		children: Snippet;
		open?: boolean;
		className?: ClassValue;
		[key: string]: any;
	}

	let { children, open = true, className, ...restProps }: Props = $props();
</script>

<Collapsible
	class={cn(
		'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=open]:animate-in',
		className
	)}
	{open}
	{...restProps}
>
	{@render children()}
</Collapsible>
