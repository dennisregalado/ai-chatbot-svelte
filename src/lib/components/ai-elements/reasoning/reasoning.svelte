<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Collapsible } from '$lib/components/ui/collapsible';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';

	// Types
	interface ReasoningContextValue {
		isStreaming: boolean;
		isOpen: boolean;
		setIsOpen: (open: boolean) => void;
		duration: number;
	}

	interface Props {
		isStreaming?: boolean; // Match React version naming
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		duration?: number;
		children?: Snippet;
		class?: string;
		// Allow other HTML attributes but exclude those that conflict with Collapsible
		[key: string]: any;
	}

	// Constants
	const AUTO_CLOSE_DELAY = 1000;
	const MS_IN_S = 1000;
	const REASONING_CONTEXT_KEY = 'reasoning';

	// Props with bindable
	let {
		class: className,
		isStreaming = false,
		open = $bindable<boolean>(),
		defaultOpen = true,
		onOpenChange,
		duration: durationProp = $bindable<number>(),
		children,
		// Extract HTML attributes, excluding Collapsible-specific props
		id,
		style,
		...restProps
	}: Props = $props();

	// State
	let duration = $state(durationProp ?? 0);
	let isOpen = $state(open ?? defaultOpen);
	let hasAutoClosedRef = $state(false);
	let startTime = $state<number | null>(null);

	// Keep internal state in sync with controlled props (if provided)
	$effect(() => {
		if (open !== undefined && isOpen !== open) {
			isOpen = open;
		}
		if (durationProp !== undefined && duration !== durationProp) {
			duration = durationProp;
		}
	});

	// Functions
	const setIsOpen = (newOpen: boolean) => {
		if (open !== undefined) {
			open = newOpen;
		} else {
			isOpen = newOpen;
		}
		onOpenChange?.(newOpen);
	};

	const setDuration = (newDuration: number) => {
		if (durationProp !== undefined) {
			durationProp = newDuration;
		} else {
			duration = newDuration;
		}
	};

	// Effects for duration tracking
	$effect(() => {
		if (isStreaming) {
			if (startTime === null) {
				startTime = Date.now();
			}
		} else if (startTime !== null) {
			const calculatedDuration = Math.ceil((Date.now() - startTime) / MS_IN_S);
			setDuration(calculatedDuration);
			startTime = null;
		}
	});

	// Auto-open when streaming starts
	// Auto-close effect
	$effect(() => {
		if (defaultOpen && !isStreaming && isOpen && !hasAutoClosedRef) {
			const timer = setTimeout(() => {
				setIsOpen(false);
				hasAutoClosedRef = true;
			}, AUTO_CLOSE_DELAY);

			return () => clearTimeout(timer);
		}
	});

	// Fire onOpenChange when internal open state changes (mirror React onChange)
	$effect(() => {
		onOpenChange?.(isOpen);
	});

	// Create reactive context using derived
	const contextValue = $derived({
		isStreaming,
		isOpen,
		setIsOpen,
		duration
	});

	setContext(REASONING_CONTEXT_KEY, () => contextValue);
</script>

<Collapsible
	class={cn('not-prose mb-4', className)}
	bind:open={isOpen}
	{id}
	{style}
	{...restProps}
>
	{@render children?.()}
</Collapsible>
