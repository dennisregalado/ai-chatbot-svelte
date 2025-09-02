<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClassValue } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		className?: ClassValue;
	}

	let { children, className, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'inline-flex items-center gap-1 rounded-md border bg-secondary px-1.5 py-0.5 text-xs text-foreground',
		className
	)}
	{...restProps}
>
	{@render children()}
</div>
