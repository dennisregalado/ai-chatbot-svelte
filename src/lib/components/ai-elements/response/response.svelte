<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import Markdown from '$components/markdown.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		class?: string;
		md: string;
	}

	let { class: className, children, md, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'size-full [&_code]:break-words [&_code]:whitespace-pre-wrap [&_pre]:max-w-full [&_pre]:overflow-x-auto [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
		className
	)}
	{...restProps}
>
	<Markdown {md} />
</div>
