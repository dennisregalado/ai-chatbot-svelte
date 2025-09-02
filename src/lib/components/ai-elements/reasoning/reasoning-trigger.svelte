<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { CollapsibleTrigger } from '$lib/components/ui/collapsible';
	import BrainIcon from '@lucide/svelte/icons/brain';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';

	interface ReasoningContextValue {
		isStreaming: boolean;
		isOpen: boolean;
		setIsOpen: (open: boolean) => void;
		duration: number;
	}

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		children?: Snippet;
		class?: string;
	}

	let { class: className, children, ...restProps }: Props = $props();

	const context = getContext<ReasoningContextValue>('reasoning');
	if (!context) {
		throw new Error('ReasoningTrigger must be used within Reasoning');
	}

	const { isStreaming, isOpen, duration } = context;
</script>

<CollapsibleTrigger
	class={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{@render BrainIcon()}
		{#if isStreaming || duration === 0}
			<p>Thinking...</p>
		{:else}
			<p>Thought for {duration} seconds</p>
		{/if}
		<div
			class={cn(
				'size-4 text-muted-foreground transition-transform',
				isOpen ? 'rotate-180' : 'rotate-0'
			)}
		>
			{@render ChevronDownIcon()}
		</div>
	{/if}
</CollapsibleTrigger>
