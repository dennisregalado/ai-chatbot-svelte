<script lang="ts">
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import AppSidebar from '$components/app-sidebar.svelte';
	import DataStreamProvider from '$components/data-stream-provider.svelte';
	import SidebarUserNav from '$components/sidebar-user-nav.svelte';
	import Upgrade from '$components/upgrade.svelte';
	import Feedback from '$components/feedback.svelte';
	import { Button, buttonVariants } from '$components/ui/button';
	import Credits from '$components/credits.svelte';
	let { data, children } = $props();
	let { isCollapsed, user } = $derived(data);
</script>

<div
	class="flex max-h-dvh min-h-dvh w-full flex-col overflow-auto bg-sidebar"
	data-vaul-drawer-wrapper
>
	<DataStreamProvider>
		<header
			class="@container/chat-header relative z-20 flex h-12.5 w-full shrink-0 items-center justify-between gap-4 px-3 sm:px-2"
		>
			<div class="flex min-w-0 flex-1 items-center"></div>
			<div class="flex flex-1 items-center justify-end gap-1.5">
				{#if user}
					<Upgrade variant="outline" size="sm">Upgrade</Upgrade>
					<Feedback variant="outline" size="sm">Feedback</Feedback>
					<Credits />
					<SidebarUserNav />
				{:else}
					<a href="/login" class={buttonVariants({ variant: 'outline', size: 'sm' })}>Sign In</a>
				{/if}
			</div>
		</header>
		<Sidebar.Provider
			open={!isCollapsed}
			class="max-h-[calc(100dvh-50px)] min-h-[calc(100dvh-50px)]"
		>
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
		</Sidebar.Provider>
	</DataStreamProvider>
</div>
