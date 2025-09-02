<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = WithElementRef<HTMLAttributes<HTMLQuoteElement>>;

	let { ref = $bindable(null), class: className, children, ...restProps }: Props = $props();
</script>

<blockquote
	bind:this={ref}
	class={cn('border-l-2 border-muted pl-3 text-sm text-muted-foreground italic', className)}
	{...restProps}
>
	{@render children?.()}
</blockquote>
