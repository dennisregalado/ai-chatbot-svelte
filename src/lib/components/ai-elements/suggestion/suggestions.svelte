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

<div class="w-full shrink-0 overflow-x-auto whitespace-nowrap" {...restProps}>
	<div class={cn('flex w-max flex-nowrap items-center gap-2', className)}>
		{@render children()}
	</div>
</div>
