<script lang="ts" module>
	import type { ButtonProps } from '$lib/components/ui/button/button.svelte';
	import type { Snippet } from 'svelte';

	export type BranchPreviousProps = ButtonProps & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import type { BranchContextType } from './branch.svelte';

	let { class: className, children, ...props }: BranchPreviousProps = $props();

	const branchContext = getContext<BranchContextType>('branch');

	if (!branchContext) {
		throw new Error('BranchPrevious must be used within Branch');
	}

	const { goToPrevious, totalBranches } = branchContext;
</script>

<Button
	aria-label="Previous branch"
	class={cn(
		'size-7 shrink-0 rounded-full text-muted-foreground transition-colors',
		'hover:bg-accent hover:text-foreground',
		'disabled:pointer-events-none disabled:opacity-50',
		className
	)}
	disabled={totalBranches <= 1}
	onclick={goToPrevious}
	size="icon"
	type="button"
	variant="ghost"
	{...props}
>
	{#if children}
		{@render children()}
	{:else}
		<ChevronLeftIcon size={14} />
	{/if}
</Button>
