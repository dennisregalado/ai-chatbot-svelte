<script lang="ts">
	import { LoaderIcon } from './icons.svelte';

	interface ImageEditorProps {
		title: string;
		content: string;
		status: string;
		isInline: boolean;
	}

	let { title, content, status, isInline }: ImageEditorProps = $props();
</script>

<div
	class="flex w-full flex-row items-center justify-center"
	class:h-[calc(100dvh-60px)]={!isInline}
	class:h-[200px]={isInline}
>
	{#if status === 'streaming'}
		<div class="flex flex-row items-center gap-4">
			{#if !isInline}
				<div class="animate-spin">
					{@render LoaderIcon()}
				</div>
			{/if}
			<div>Generating Image...</div>
		</div>
	{:else}
		<picture>
			<img
				class="h-fit w-full max-w-[800px]"
				class:p-0={!isInline}
				class:md:p-20={!isInline}
				src={`data:image/png;base64,${content}`}
				alt={title}
			/>
		</picture>
	{/if}
</div>
