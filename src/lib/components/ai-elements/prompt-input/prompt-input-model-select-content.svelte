<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { DropdownMenuContent } from '$lib/components/ui/dropdown-menu/index.js';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		class?: ClassValue;
		children?: Snippet;
		[key: string]: any;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<DropdownMenuContent class={cn(className)} {...restProps}>
	{@render children?.()}
</DropdownMenuContent>
