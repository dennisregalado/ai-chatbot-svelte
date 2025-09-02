<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>>;

	let { ref = $bindable(null), class: className, children, ...restProps }: Props = $props();
</script>

<div
	bind:this={ref}
	class={cn('flex items-center justify-between gap-2 rounded-t-md bg-secondary p-2', className)}
	{...restProps}
>
	{@render children?.()}
</div>
