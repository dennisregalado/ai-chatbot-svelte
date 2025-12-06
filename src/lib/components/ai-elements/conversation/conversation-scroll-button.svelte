<script lang="ts">
	import { getContext } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import type { ClassValue } from 'svelte/elements';
	import type { StickToBottom } from 'stick-to-bottom-svelte';

	interface Props {
		class?: ClassValue;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	}

	let { class: className, size = 'icon', variant = 'outline', ...restProps }: Props = $props();

	// Get the stick-to-bottom context from the parent Conversation component
	const stickToBottom = getContext<StickToBottom>('stickToBottom');

	if (!stickToBottom) {
		throw new Error('ConversationScrollButton must be used within a Conversation component');
	}

	function handleScrollToBottom() {
		const animation = { damping: 0.7, stiffness: 0.05, mass: 1.25 };
		stickToBottom.scrollToBottom({ animation });
	}
</script>

{#if !stickToBottom.isNearBottom}
	<Button
		class={cn('sticky bottom-4 left-[50%] translate-x-[-50%] rounded-full', className)}
		onclick={handleScrollToBottom}
		{size}
		type="button"
		{variant}
		{...restProps}
	>
		<ChevronDownIcon class="size-4" />
	</Button>
{/if}
