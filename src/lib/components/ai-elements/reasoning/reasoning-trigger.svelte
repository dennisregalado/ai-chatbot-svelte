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

	interface Props {
		children?: Snippet;
		class?: string;
		// Allow other HTML attributes
		[key: string]: any;
	}

	let {
		class: className,
		children,
		// Extract safe HTML attributes
		id,
		style,
		...restProps
	}: Props = $props();

	const getReasoningContext = getContext<() => ReasoningContextValue>('reasoning');
	if (!getReasoningContext) {
		throw new Error('ReasoningTrigger must be used within Reasoning');
	}

	const { isStreaming, isOpen, duration } = $derived(getReasoningContext());
</script>

<CollapsibleTrigger
	class={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}
	{id}
	{style}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<BrainIcon class="size-4" />
		{#if isStreaming || duration === 0}
			<p>Thinking...</p>
		{:else}
			<p>Thought for {duration} seconds</p>
		{/if}
		<ChevronDownIcon
			class={cn(
				'size-4 text-muted-foreground transition-transform',
				isOpen ? 'rotate-180' : 'rotate-0'
			)}
		/>
	{/if}
</CollapsibleTrigger>
