<script lang="ts">
	import { getContext } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { ChevronDownIcon } from '$lib/components/icons.svelte';
	import type { ClassValue } from 'svelte/elements';
	
	interface Props {
		class?: ClassValue;
		size?: 'default' | 'sm' | 'lg' | 'icon';
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	}
	
	let { 
		class: className,
		size = 'icon',
		variant = 'outline',
		...restProps 
	}: Props = $props();
	
	// Get the stick-to-bottom context from the parent Conversation component
	const context = getContext<{
		stickToBottom: any;
		scrollElement: () => HTMLElement | undefined;
		contentElement: () => HTMLElement | undefined;
	}>('stickToBottom');
	
	if (!context) {
		throw new Error('ConversationScrollButton must be used within a Conversation component');
	}
	
	const { stickToBottom } = context;
	
	function handleScrollToBottom() {
		stickToBottom.scrollToBottom();
	}
</script>

{#if !stickToBottom.isNearBottom}
	<Button
		class={cn(
			'absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full',
			className
		)}
		onclick={handleScrollToBottom}
		{size}
		type="button"
		{variant}
		{...restProps}
	>
		{@render ChevronDownIcon(16)}
	</Button>
{/if}
