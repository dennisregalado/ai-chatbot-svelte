<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { useUnderlineTabs } from './underline-tabs.svelte.js';
	import { box } from 'svelte-toolbelt';

	const uid = $props.id();

	let {
		ref = $bindable(null),
		value = $bindable(''),
		id = uid,
		hoverOnly = false,
		class: className,
		...restProps
	}: Omit<TabsPrimitive.RootProps, 'orientation' | 'id'> & { id?: string; hoverOnly?: boolean } = $props();

	useUnderlineTabs({
		value: box.with(
			() => value,
			(v) => (value = v)
		),
		id: box.with(() => id),
		hoverOnly: box.with(() => hoverOnly)
	});
</script>

<TabsPrimitive.Root
	bind:ref
	bind:value
	orientation="horizontal"
	data-slot="underline-tabs"
	class={cn('flex flex-col gap-2', className)}
	{...restProps}
/>
