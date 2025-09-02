<script lang="ts">
	import { cn } from '$lib/utils';
	import { createWebPreviewContext } from './web-preview-context';

	let {
		class: className,
		children,
		defaultUrl = '',
		onUrlChange,
		...props
	}: {
		class?: string;
		children?: any;
		defaultUrl?: string;
		onUrlChange?: (url: string) => void;
	} = $props();

	// Create the context when component mounts
	createWebPreviewContext(defaultUrl, onUrlChange);
</script>

<div class={cn('flex size-full flex-col rounded-lg border bg-card', className)} {...props}>
	{@render children?.()}
</div>
