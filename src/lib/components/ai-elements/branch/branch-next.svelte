<script lang="ts" module>
	import type { ButtonProps } from '$lib/components/ui/button/button.svelte';
	import type { Snippet } from 'svelte';

	export type BranchNextProps = ButtonProps & {
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { BranchContextType } from './branch.svelte';

	let { class: className, children, ...props }: BranchNextProps = $props();

	const branchContext = getContext<BranchContextType>('branch');

	if (!branchContext) {
		throw new Error('BranchNext must be used within Branch');
	}

	const { goToNext, totalBranches } = branchContext;
</script>

<Button
	aria-label="Next branch"
	class={cn(
		'size-7 shrink-0 rounded-full text-muted-foreground transition-colors',
		'hover:bg-accent hover:text-foreground',
		'disabled:pointer-events-none disabled:opacity-50',
		className
	)}
	disabled={totalBranches <= 1}
	onclick={goToNext}
	size="icon"
	type="button"
	variant="ghost"
	{...props}
>
	{#if children}
		{@render children()}
	{:else}
		<ChevronRightIcon size={14} />
	{/if}
</Button>
