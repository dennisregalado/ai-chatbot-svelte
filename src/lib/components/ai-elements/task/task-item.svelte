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

<div class={cn('text-muted-foreground text-sm', className)} {...restProps}>
	{@render children()}
</div>
