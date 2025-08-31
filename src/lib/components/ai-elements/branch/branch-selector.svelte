<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { UIMessage } from 'ai';
	import type { Snippet } from 'svelte';

	export type BranchSelectorProps = HTMLAttributes<HTMLDivElement> & {
		from: UIMessage['role'];
		children: Snippet;
	};
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { BranchContextType } from './branch.svelte';

	let { from, class: className, children, ...props }: BranchSelectorProps = $props();

	const branchContext = getContext<BranchContextType>('branch');

	if (!branchContext) {
		throw new Error('BranchSelector must be used within Branch');
	}

	const { totalBranches } = branchContext;
</script>

{#if totalBranches > 1}
	<div
		class={cn(
			'flex items-center gap-2 self-end px-10',
			from === 'assistant' ? 'justify-start' : 'justify-end',
			className
		)}
		{...props}
	>
		{@render children()}
	</div>
{/if}
