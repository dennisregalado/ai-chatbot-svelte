<script lang="ts">
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import {
		SIDEBAR_COOKIE_MAX_AGE,
		SIDEBAR_COOKIE_NAME,
		SIDEBAR_WIDTH,
		SIDEBAR_WIDTH_ICON,
	} from "./constants.js";
	import { setSidebar } from "./context.svelte.js";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		open = $bindable(true),
		onOpenChange = () => {},
		class: className,
		style,
		header,
		inset,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		header?: Snippet;
		inset?: Snippet;
	} = $props();

	const sidebar = setSidebar({
		open: () => open,
		setOpen: (value: boolean) => {
			open = value;
			onOpenChange(value);

			// This sets the cookie to keep the sidebar state.
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		},
	});
</script>

<svelte:window onkeydown={sidebar.handleShortcutKeydown} />

{#if header}
	{@render header?.()}
{/if}
<Tooltip.Provider delayDuration={0}>
	<div
		data-slot="sidebar-wrapper"
		style="--sidebar-width: {SIDEBAR_WIDTH}; --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {style}"
		class={cn(
			"group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
			className
		)}
		bind:this={ref}
		{...restProps}
	>
		{#if inset}
			{@render inset?.()}
		{/if}
	</div>
</Tooltip.Provider>
