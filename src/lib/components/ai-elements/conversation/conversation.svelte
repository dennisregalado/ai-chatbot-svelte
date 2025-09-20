<script lang="ts">
	import { StickToBottom } from 'stick-to-bottom-svelte';
	import { setContext } from 'svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import ConversationScrollButton from './conversation-scroll-button.svelte';

	interface Props {
		class?: ClassValue;
		button?: Snippet;
		children?: Snippet;
		initial?: 'smooth' | 'instant';
		resize?: 'smooth' | 'instant';
	}

	let {
		class: className,
		children,
		initial = 'smooth',
		resize = 'smooth',
		...restProps
	}: Props = $props();

	// Elements for the stick-to-bottom functionality
	let scrollElement = $state<HTMLElement>();
	let contentElement = $state<HTMLElement>();

	// Initialize StickToBottom with smooth animations
	const stickToBottom = new StickToBottom({
		scrollElement: () => scrollElement,
		contentElement: () => contentElement,
		initial,
		resize,
		// Spring animation configuration for smooth chat experience
		damping: 0.7,
		stiffness: 0.05,
		mass: 1.25
	});

	// Provide the stick-to-bottom context for child components
	setContext('stickToBottom', stickToBottom);
</script>

<!-- Main conversation container -->
<div
	bind:this={scrollElement}
	class={cn('relative w-full flex-1 overflow-y-auto', className)}
	role="log"
	{...restProps}
>
	<div class="mx-auto max-w-3xl p-4" bind:this={contentElement}>
		{@render children?.()}
	</div>
	<ConversationScrollButton />
</div>
