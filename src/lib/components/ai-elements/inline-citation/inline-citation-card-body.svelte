<script lang="ts">
	import { HoverCardContent } from '$lib/components/ui/hover-card';
	import { cn, type WithElementRef } from '$lib/utils';

	type Props = WithElementRef<{
		class?: string;
		children?: import('svelte').Snippet;
	}>;

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<HoverCardContent
	bind:ref
	class={cn('relative w-80 p-0', className)}
	{...restProps}
>
	{@render children?.()}
</HoverCardContent>
