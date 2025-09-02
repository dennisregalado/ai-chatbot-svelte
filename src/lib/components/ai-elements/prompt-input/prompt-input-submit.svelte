<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { ButtonProps } from '$lib/components/ui/button/button.svelte';
	import type { ChatStatus } from 'ai';
	import type { Snippet } from 'svelte';
	import SendIcon from '@lucide/svelte/icons/send';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import SquareIcon from '@lucide/svelte/icons/square';
	import XIcon from '@lucide/svelte/icons/x';

	interface Props extends ButtonProps {
		status?: ChatStatus;
		children?: Snippet;
	}

	let {
		class: className,
		variant = 'default',
		size = 'icon',
		status,
		children,
		...restProps
	}: Props = $props();
</script>

<Button class={cn('gap-1.5 rounded-lg', className)} {size} type="submit" {variant} {...restProps}>
	{#if children}
		{@render children()}
	{:else if status === 'submitted'}
		<Loader2Icon class="size-4 animate-spin" />
	{:else if status === 'streaming'}
		<SquareIcon class="size-4" />
	{:else if status === 'error'}
		<XIcon class="size-4" />
	{:else}
		<SendIcon class="size-4" />
	{/if}
</Button>
