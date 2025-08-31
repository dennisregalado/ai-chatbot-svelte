<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = WithElementRef<HTMLAttributes<HTMLQuoteElement>>;

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<blockquote
	bind:this={ref}
	class={cn(
		'border-muted border-l-2 pl-3 text-muted-foreground text-sm italic',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</blockquote>
