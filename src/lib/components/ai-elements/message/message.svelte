<script lang="ts">
	import { cn } from '$lib/utils';
	import type { UIMessage } from 'ai';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		from: UIMessage['role'];
		children?: Snippet;
	}

	let {
		class: className,
		from,
		children,
		...restProps
	}: Props = $props();
</script>

<div
	class={cn(
		'group flex flex-col w-full justify-end gap-2 py-4',
		from === 'user' ? 'is-user items-end' : 'is-assistant justify-end',
		'[&>div]:max-w-[80%]',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>