<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { DropdownMenuItem } from '$lib/components/ui/dropdown-menu/index.js';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		class?: ClassValue;
		value: string;
		onSelect?: () => void;
		children?: Snippet;
		[key: string]: any;
	}

	let { class: className, value, onSelect, children, ...restProps }: Props = $props();
</script>

<DropdownMenuItem class={cn(className)} {onSelect} {...restProps}>
	{@render children?.()}
</DropdownMenuItem>
