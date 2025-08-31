<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { ButtonProps } from '$lib/components/ui/button/button.svelte';
	import type { Snippet } from 'svelte';

	interface Props extends ButtonProps {
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<DropdownMenuTrigger>
	{#snippet child({ props })}
		<Button
			{...props}
			class={cn(
				'border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors',
				'hover:bg-accent hover:text-foreground [&[aria-expanded="true"]]:bg-accent [&[aria-expanded="true"]]:text-foreground',
				className
			)}
			{...restProps}
		>
			{@render children?.()}
		</Button>
	{/snippet}
</DropdownMenuTrigger>
