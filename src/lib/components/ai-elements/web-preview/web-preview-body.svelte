<script lang="ts">
	import { cn } from '$lib/utils';
	import { useWebPreview } from './web-preview-context';

	let {
		class: className,
		loading,
		src,
		...props
	}: {
		class?: string;
		loading?: any;
		src?: string;
	} = $props();

	const { url } = useWebPreview();
</script>

<div class="flex-1">
	<iframe
		class={cn('size-full', className)}
		sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
		src={(src ?? url) || undefined}
		title="Preview"
		{...props}
	></iframe>
	{#if loading}
		{@render loading()}
	{/if}
</div>
