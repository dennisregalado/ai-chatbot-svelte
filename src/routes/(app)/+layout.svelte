<script lang="ts">
	import { createAIContext } from '@ai-sdk/svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import AppSidebar from '$components/app-sidebar.svelte';
	import { getSidebarState } from '$remote/sidebar.remote';
	import { getUser } from '$remote/auth.remote'; 
	import DataStreamProvider from '$components/data-stream-provider.svelte';
	import Header from '$components/header.svelte';

	let { children } = $props();

	let isCollapsed = $derived(await getSidebarState());
	let user = $derived(await getUser()); 

//	createAIContext();
	// all hooks created after this or in components that are children of this component
	// will have synchronized state
</script>

<div
	class="flex max-h-dvh min-h-dvh w-full flex-col overflow-auto bg-sidebar"
	data-vaul-drawer-wrapper
> 
<DataStreamProvider> 
		<Sidebar.Provider
			open={!isCollapsed}
			class="max-h-[calc(100dvh-50px)] min-h-[calc(100dvh-50px)]"
		>
		{#snippet header()}
			<Header />
		{/snippet}
		{#snippet inset()}
			{#if user}
				<AppSidebar />
			{/if}
			<Sidebar.Inset>
				{#if user}
					<header class="absolute top-0 left-0 z-10 flex h-16 shrink-0 items-center gap-2">
						<div class="flex items-center gap-2 px-4">
							<Sidebar.Trigger class="-ml-1" />
						</div>
					</header>
				{/if}
				{@render children?.()}
			</Sidebar.Inset>
			{/snippet}
		</Sidebar.Provider> 
</DataStreamProvider>
</div>
