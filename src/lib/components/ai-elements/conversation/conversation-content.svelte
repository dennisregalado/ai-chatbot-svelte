<script lang="ts">
	import { cn } from '$lib/utils';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		class?: ClassValue;
		children?: import('svelte').Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn('p-4', className)} {...restProps}>
	{@render children?.()}
</div>
