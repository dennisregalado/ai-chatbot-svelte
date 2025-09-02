<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';
	import { CopyIcon, CheckCircleFillIcon } from '$lib/components/icons.svelte';
	import { getCodeBlockContext } from './code-block-context.svelte.js';
	import type { ButtonProps } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';

	export interface CodeBlockCopyButtonProps extends ButtonProps {
		onCopy?: () => void;
		onError?: (error: Error) => void;
		timeout?: number;
		children?: Snippet;
		class?: string;
	}

	let {
		onCopy,
		onError,
		timeout = 2000,
		children,
		class: className,
		...restProps
	}: CodeBlockCopyButtonProps = $props();

	// Get code from context
	const { code } = getCodeBlockContext();

	let isCopied = $state(false);

	async function copyToClipboard() {
		if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
			onError?.(new Error('Clipboard API not available'));
			return;
		}

		try {
			await navigator.clipboard.writeText(code);
			isCopied = true;
			onCopy?.();
			setTimeout(() => {
				isCopied = false;
			}, timeout);
		} catch (error) {
			onError?.(error as Error);
		}
	}

	const Icon = $derived(isCopied ? CheckCircleFillIcon : CopyIcon);
</script>

<Button
	class={cn('shrink-0', className)}
	onclick={copyToClipboard}
	size="icon"
	variant="ghost"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{@render Icon(14)}
	{/if}
</Button>
