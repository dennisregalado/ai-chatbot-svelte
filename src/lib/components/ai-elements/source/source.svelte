<script lang="ts">
	import BookIcon from '@lucide/svelte/icons/book';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLAnchorElement> {
		href?: string;
		title?: string;
		children?: Snippet;
	}

	let { href, title, children, ...restProps }: Props = $props();
</script>

<a class="flex items-center gap-2" {href} rel="noreferrer" target="_blank" {...restProps}>
	{#if children}
		{@render children()}
	{:else}
		<BookIcon class="h-4 w-4" />
		<span class="block font-medium">{title}</span>
	{/if}
</a>
