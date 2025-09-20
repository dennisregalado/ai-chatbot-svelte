<script lang="ts">
	import { cn, sanitizeText } from '$lib/utils.js';
	import { CollapsibleContent } from '$lib/components/ui/collapsible';
	import Response from '../response/response.svelte'; 

	let { class: className, content, ...restProps } = $props();
</script>

<CollapsibleContent
	{...restProps}
	class={cn(
		'mt-4 text-sm',
		'text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2',
		className
	)}
>
	<Response class="grid gap-2" content={sanitizeText(content)} />
</CollapsibleContent>
