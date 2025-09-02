<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends WithoutChildren<WithElementRef<HTMLTextareaAttributes>> {
		minHeight?: number;
		maxHeight?: number;
	}

	let {
		class: className,
		placeholder = 'What would you like to know?',
		minHeight = 48,
		maxHeight = 164,
		value = $bindable(),
		...restProps
	}: Props = $props();

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// Don't submit if IME composition is in progress
			if ((e as any).nativeEvent?.isComposing) {
				return;
			}

			if (e.shiftKey) {
				// Allow newline
				return;
			}

			// Submit on Enter (without Shift)
			e.preventDefault();
			const form = (e.currentTarget as HTMLTextAreaElement).form;
			if (form) {
				form.requestSubmit();
			}
		}
	};
</script>

<Textarea
	bind:value
	class={cn(
		'w-full resize-none rounded-none border-none p-3 shadow-none ring-0 outline-none',
		'field-sizing-content max-h-[6lh] bg-transparent dark:bg-transparent',
		'focus-visible:ring-0',
		className
	)}
	name="message"
	{placeholder}
	onkeydown={handleKeyDown}
	{...restProps}
/>
