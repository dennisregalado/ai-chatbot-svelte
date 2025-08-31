<script lang="ts">
	import { StickToBottom } from 'stick-to-bottom-svelte';
	import { setContext } from 'svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

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
		button,
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
		stiffness: 0.08,
		mass: 1.2
	});

	// Provide the stick-to-bottom context for child components
	setContext('stickToBottom', {
		stickToBottom,
		scrollElement: () => scrollElement,
		contentElement: () => contentElement,
		setContentElement: (element: HTMLElement) => {
			contentElement = element;
		}
	});
</script>

<!-- Main conversation container -->
<div
	bind:this={scrollElement}
	class={cn('relative flex-1 overflow-y-auto', className)}
	role="log"
	{...restProps}
>
	<div class="p-4" bind:this={contentElement}>
		{@render children?.()}
	</div>
	{#if button}
		{@render button()}
	{/if}
</div>
