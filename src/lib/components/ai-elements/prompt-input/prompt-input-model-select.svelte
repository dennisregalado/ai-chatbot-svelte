<script lang="ts">
	import { DropdownMenu } from '$lib/components/ui/dropdown-menu/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		children?: Snippet;
	}

	let { open, onOpenChange, children }: Props = $props();
</script>

<DropdownMenu {open} {onOpenChange}>
	{@render children?.()}
</DropdownMenu>
