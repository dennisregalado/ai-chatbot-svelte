<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { Streamdown } from 'svelte-streamdown';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		class?: string;
		content: string;
	}

	let { class: className, children, content, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'size-full [&_code]:break-words [&_code]:whitespace-pre-wrap [&_pre]:max-w-full [&_pre]:overflow-x-auto [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
		className
	)}
	{...restProps}
>
	<Streamdown {content} animation={{ enabled: true, type: 'fade' }} />
</div>
