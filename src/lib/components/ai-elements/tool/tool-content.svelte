<script lang="ts">
	import { CollapsibleContent } from '$lib/components/ui/collapsible';
	import { cn } from '$lib/utils';

	let {
		class: className,
		children,
		...props
	}: {
		class?: string;
		children?: any;
	} = $props();
</script>

<CollapsibleContent
	class={cn(
		'text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2',
		className
	)}
	{...props}
>
	{@render children?.()}
</CollapsibleContent>
