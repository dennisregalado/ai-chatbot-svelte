<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLFormAttributes {
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<form
	class={cn(
		'w-full overflow-hidden rounded-xl border bg-background shadow-sm',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</form>
