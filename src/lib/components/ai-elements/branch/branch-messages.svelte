<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type BranchMessagesProps = HTMLAttributes<HTMLDivElement> & {
		children: Snippet;
	};
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { BranchContextType } from './branch.svelte';

	let { children, class: className, ...props }: BranchMessagesProps = $props();

	const branchContext = getContext<BranchContextType>('branch');

	if (!branchContext) {
		throw new Error('BranchMessages must be used within Branch');
	}

	const { currentBranch, setBranches, branches } = branchContext;

	// We'll need to handle the children as branches
	// In Svelte, we can't easily get an array of children like in React
	// We'll need to pass branches explicitly or handle this differently
	let branchChildren = $state<Snippet[]>([]);

	$effect(() => {
		if (branches.length !== branchChildren.length) {
			setBranches(branchChildren);
		}
	});

	// For now, we'll render the children directly
	// The parent component will need to manage the branches properly
</script>

{#if branches.length > 0}
	{#each branches as branch, index}
		<div
			class={cn(
				'grid gap-2 overflow-hidden [&>div]:pb-0',
				index === currentBranch ? 'block' : 'hidden'
			)}
			{...props}
		>
			{@render branch()}
		</div>
	{/each}
{:else}
	<div class={cn('grid gap-2 overflow-hidden [&>div]:pb-0', className)} {...props}>
		{@render children()}
	</div>
{/if}
