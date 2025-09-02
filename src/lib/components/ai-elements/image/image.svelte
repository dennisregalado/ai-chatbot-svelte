<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Experimental_GeneratedImage } from 'ai';
	import type { ClassValue } from 'svelte/elements';

	export interface ImageProps extends Experimental_GeneratedImage {
		className?: ClassValue;
		alt?: string;
	}

	let { base64, uint8Array, mediaType, className, alt, ...restProps }: ImageProps = $props();
</script>

<img
	{...restProps}
	{alt}
	class={cn('h-auto max-w-full overflow-hidden rounded-md', className)}
	src="data:{mediaType};base64,{base64}"
/>
