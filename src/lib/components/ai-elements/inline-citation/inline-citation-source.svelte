<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		title?: string;
		url?: string;
		description?: string;
	} & WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let {
		title,
		url,
		description,
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<div bind:this={ref} class={cn('space-y-1', className)} {...restProps}>
	{#if title}
		<h4 class="truncate font-medium text-sm leading-tight">{title}</h4>
	{/if}
	{#if url}
		<p class="truncate break-all text-muted-foreground text-xs">{url}</p>
	{/if}
	{#if description}
		<p class="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
			{description}
		</p>
	{/if}
	{@render children?.()}
</div>
