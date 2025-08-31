<script lang="ts" module>
	import { cn } from '$lib/utils.js';
	import type { UIMessage } from 'ai';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	export type BranchContextType = {
		currentBranch: number;
		totalBranches: number;
		goToPrevious: () => void;
		goToNext: () => void;
		branches: Snippet[];
		setBranches: (branches: Snippet[]) => void;
	};

	export type BranchProps = HTMLAttributes<HTMLDivElement> & {
		defaultBranch?: number;
		onBranchChange?: (branchIndex: number) => void;
		children: Snippet;
	};
</script>

<script lang="ts">
	import { setContext } from 'svelte';

	let {
		defaultBranch = 0,
		onBranchChange,
		class: className,
		children,
		...props
	}: BranchProps = $props();

	let currentBranch = $state(defaultBranch);
	let branches = $state<Snippet[]>([]);

	const handleBranchChange = (newBranch: number) => {
		currentBranch = newBranch;
		onBranchChange?.(newBranch);
	};

	const goToPrevious = () => {
		const newBranch = currentBranch > 0 ? currentBranch - 1 : branches.length - 1;
		handleBranchChange(newBranch);
	};

	const goToNext = () => {
		const newBranch = currentBranch < branches.length - 1 ? currentBranch + 1 : 0;
		handleBranchChange(newBranch);
	};

	const setBranches = (newBranches: Snippet[]) => {
		branches = newBranches;
	};

	const contextValue: BranchContextType = {
		get currentBranch() {
			return currentBranch;
		},
		get totalBranches() {
			return branches.length;
		},
		goToPrevious,
		goToNext,
		get branches() {
			return branches;
		},
		setBranches
	};

	setContext('branch', contextValue);
</script>

<div class={cn('grid w-full gap-2 [&>div]:pb-0', className)} {...props}>
	{@render children()}
</div>
