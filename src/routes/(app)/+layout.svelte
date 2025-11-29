<script lang="ts">
	import { createAIContext } from '@ai-sdk/svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import AppSidebar from '$components/app-sidebar.svelte';
	import DataStreamProvider from '$components/data-stream-provider.svelte';
	import SidebarUserNav from '$components/sidebar-user-nav.svelte';
	import Upgrade from '$components/upgrade.svelte';
	import Feedback from '$components/feedback.svelte';
	import { buttonVariants } from '$components/ui/button';
	import Credits from '$components/credits.svelte';
	import { getSidebarState } from '$remote/sidebar.remote';
	import { getUser } from '$remote/auth.remote';
	import WorkspaceSwitcher from '$components/workspace-switcher.svelte';

	let { children } = $props();

	let isCollapsed = $derived(await getSidebarState());
	let user = $derived(await getUser()); 

	createAIContext();
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
		<header
		class="@container/chat-header relative z-20 flex h-12.5 w-full shrink-0 items-center justify-between gap-4 px-3 sm:px-2"
	>
		<div class="flex min-w-0 flex-1 items-center">
			<WorkspaceSwitcher />
		</div>
		<div class="flex flex-1 items-center justify-end gap-1.5">
			{#if user}
				<Upgrade variant="outline" size="sm">Upgrade</Upgrade>
				<Feedback variant="outline" size="sm">Feedback</Feedback>
				<SidebarUserNav />
			{:else}
				<a href="/signin" class={buttonVariants({ variant: 'outline', size: 'sm' })}>Sign In</a>
			{/if}
		</div>
	</header>
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
