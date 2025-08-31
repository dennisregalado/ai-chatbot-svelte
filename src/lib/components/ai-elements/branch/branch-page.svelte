<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type BranchPageProps = HTMLAttributes<HTMLSpanElement>;
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { BranchContextType } from './branch.svelte';

	let { class: className, ...props }: BranchPageProps = $props();

	const branchContext = getContext<BranchContextType>('branch');

	if (!branchContext) {
		throw new Error('BranchPage must be used within Branch');
	}

	const { currentBranch, totalBranches } = branchContext;
</script>

<span
	class={cn(
		'font-medium text-muted-foreground text-xs tabular-nums',
		className
	)}
	{...props}
>
	{currentBranch + 1} of {totalBranches}
</span>
