<script lang="ts">
	import { createAIContext } from '@ai-sdk/svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import { getSidebarState } from '$remote/sidebar.remote';
	import Header from '$components/header.svelte';

	let { children } = $props();

	let isCollapsed = $derived(await getSidebarState());

	//	createAIContext();
	// all hooks created after this or in components that are children of this component
	// will have synchronized state
</script>

<div
	class="flex max-h-dvh min-h-dvh w-full flex-col overflow-auto bg-sidebar"
	data-vaul-drawer-wrapper
>
	<Sidebar.Provider open={!isCollapsed} class="max-h-[calc(100dvh-50px)] min-h-[calc(100dvh-50px)]">
		{#snippet header()}
			<Header />
		{/snippet}
		{#snippet inset()}
			{@render children?.()}
		{/snippet}
	</Sidebar.Provider>
</div>
