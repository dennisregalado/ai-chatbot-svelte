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

	interface Props extends HTMLAttributes<HTMLDivElement> {
		isStreaming?: boolean;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		duration?: number;
		children?: Snippet;
		class?: string;
	}

	// Constants
	const AUTO_CLOSE_DELAY = 1000;
	const MS_IN_S = 1000;
	const REASONING_CONTEXT_KEY = 'reasoning';

	// Props
	let {
		class: className,
		isStreaming = false,
		open = $bindable(),
		defaultOpen = true,
		onOpenChange,
		duration: durationProp = $bindable(),
		children,
		...restProps
	}: Props = $props();

	// State
	let duration = $state(durationProp ?? 0);
	let isOpen = $state(open ?? defaultOpen);
	let hasAutoClosedRef = $state(false);
	let startTime = $state<number | null>(null);

	// Computed values
	let currentIsOpen = $derived(open ?? isOpen);
	let currentDuration = $derived(durationProp ?? duration);

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
			setDuration(Math.round((Date.now() - startTime) / MS_IN_S));
			startTime = null;
		}
	});

	// Auto-close effect
	$effect(() => {
		if (defaultOpen && !isStreaming && currentIsOpen && !hasAutoClosedRef) {
			const timer = setTimeout(() => {
				setIsOpen(false);
				hasAutoClosedRef = true;
			}, AUTO_CLOSE_DELAY);

			return () => clearTimeout(timer);
		}
	});

	// Context
	const context: ReasoningContextValue = $derived({
		isStreaming,
		isOpen: currentIsOpen,
		setIsOpen,
		duration: currentDuration
	});

	setContext(REASONING_CONTEXT_KEY, context);
</script>

<Collapsible
	class={cn('not-prose mb-4', className)}
	onOpenChange={setIsOpen}
	bind:open={currentIsOpen}
	{...restProps}
>
	{@render children?.()}
</Collapsible>
