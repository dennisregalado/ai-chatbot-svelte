<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placeholder?: string;
		children?: Snippet;
	}

	let { class: className, placeholder, children, ...restProps }: Props = $props();
</script>

<div class={cn(className)} {...restProps}>
	{#if children}
		{@render children()}
	{:else}
		{placeholder}
	{/if}
</div>
