<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { cn } from '$lib/utils';
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		src: string;
		name?: string;
		class?:  ClassValue;
	}

	let {
		src,
		name,
		class: className
	}: Props = $props();
</script>

<Avatar class={cn('size-8 ring-1 ring-border', className)}>
	<AvatarImage alt="" class="mt-0 mb-0" {src} />
	<AvatarFallback>{name?.slice(0, 2) || 'ME'}</AvatarFallback>
</Avatar>
