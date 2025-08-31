<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let {
		children,
		class: className,
		...restProps
	}: Props = $props();
</script>

<div
	class={cn(
		'flex flex-col gap-2 overflow-hidden rounded-lg px-4 py-3 text-foreground text-sm',
		'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground',
		'group-[.is-assistant]:pl-0 group-[.is-assistant]:py-1',
		'is-user:dark',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
