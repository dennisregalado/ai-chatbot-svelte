<script lang="ts">
	import type { Attachment } from '$lib/types';
	import LoaderIcon from './icons/loader.svelte';

	let {
		attachment,
		uploading = false
	}: {
		attachment: Attachment;
		uploading?: boolean;
	} = $props();

	const { name, url, contentType } = $derived(attachment);
</script>

<div class="flex flex-col gap-2">
	<div
		class="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center"
	>
		{#if contentType && contentType.startsWith('image')}
			<img
				src={url}
				alt={name ?? 'An image attachment'}
				class="size-full rounded-md object-cover"
			/>
		{:else}
			<div></div>
		{/if}

		{#if uploading}
			<div class="absolute animate-spin text-zinc-500">
				<LoaderIcon />
			</div>
		{/if}
	</div>
	<div class="max-w-16 truncate text-xs text-zinc-500">{name}</div>
</div>
