<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { ButtonVariant, ButtonSize } from '$lib/components/ui/button';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		suggestion: string;
		onClick?: (suggestion: string) => void;
		className?: ClassValue;
		variant?: ButtonVariant;
		size?: ButtonSize;
		children?: Snippet;
		[key: string]: any;
	}

	let {
		suggestion,
		onClick,
		className,
		variant = 'outline',
		size = 'sm',
		children,
		...restProps
	}: Props = $props();

	function handleClick() {
		onClick?.(suggestion);
	}
</script>

<Button
	class={cn('cursor-pointer rounded-full px-4', className)}
	onclick={handleClick}
	{size}
	type="button"
	{variant}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{suggestion}
	{/if}
</Button>
