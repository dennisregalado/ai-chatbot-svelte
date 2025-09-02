<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { ButtonProps } from '$lib/components/ui/button/button.svelte';

	let { variant = 'ghost', class: className, size, children, ...restProps }: ButtonProps = $props();

	// Simplified check for children - in Svelte we assume children exist if passed
	const hasChildren = children !== undefined;
	const newSize = size ?? (hasChildren ? 'default' : 'icon');
</script>

<Button
	class={cn(
		'shrink-0 gap-1.5 rounded-lg',
		variant === 'ghost' && 'text-muted-foreground',
		newSize === 'default' && 'px-3',
		className
	)}
	size={newSize}
	type="button"
	{variant}
	{...restProps}
>
	{@render children?.()}
</Button>
