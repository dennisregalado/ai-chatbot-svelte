<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils.js';
	import type { ButtonProps } from '$lib/components/ui/button/button.svelte';
	import type { Snippet } from 'svelte';

	interface Props extends ButtonProps {
		tooltip?: string;
		label?: string;
		children?: Snippet;
	}

	let {
		tooltip,
		children,
		label,
		class: className,
		variant = 'ghost',
		size = 'icon',
		...restProps
	}: Props = $props();

	let buttonClasses = cn(
		'size-9 p-1.5 text-muted-foreground hover:text-foreground relative',
		className
	);
</script>

{#if tooltip}
	<TooltipProvider>
		<Tooltip delayDuration={0}>
			<TooltipTrigger>
				{#snippet child({ props })}
					<Button {...props} class={buttonClasses} {size} type="button" {variant} {...restProps}>
						{@render children?.()}
						<span class="sr-only">{label || tooltip}</span>
					</Button>
				{/snippet}
			</TooltipTrigger>
			<TooltipContent side="bottom">
				<p>{tooltip}</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
{:else}
	<Button class={buttonClasses} {size} type="button" {variant} {...restProps}>
		{@render children?.()}
		<span class="sr-only">{label || tooltip}</span>
	</Button>
{/if}
