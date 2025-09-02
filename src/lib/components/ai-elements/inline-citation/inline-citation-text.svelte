<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = WithElementRef<HTMLAttributes<HTMLSpanElement>>;

	let { ref = $bindable(null), class: className, children, ...restProps }: Props = $props();
</script>

<span
	bind:this={ref}
	class={cn('transition-colors group-hover:bg-accent', className)}
	{...restProps}
>
	{@render children?.()}
</span>
