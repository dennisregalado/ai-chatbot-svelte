<script lang="ts">
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import AppSidebar from '$components/app-sidebar.svelte';
	import DataStreamProvider from '$components/data-stream-provider.svelte';
	import { Button } from '$components/ui/button';
	import SidebarUserNav from '$components/sidebar-user-nav.svelte';

	import Credits from '$components/credits.svelte';
	let { data, children } = $props();
	let { isCollapsed } = $derived(data);
</script>

<div class="flex max-h-dvh min-h-dvh w-full flex-col overflow-auto bg-sidebar">
	<DataStreamProvider>
		<header
			class="@container/chat-header relative z-20 flex h-12.5 w-full shrink-0 items-center justify-between gap-4 px-3 sm:px-2"
		>
			<div class="flex min-w-0 flex-1 items-center"></div>
			<div class="flex flex-1 items-center justify-end gap-1.5">
				<Button variant="outline" size="sm">Upgrade</Button>
				<Button variant="outline" size="sm">Feedback</Button>
				<Credits />

				<SidebarUserNav />
			</div>
		</header>
		<Sidebar.Provider
			open={!isCollapsed}
			class="max-h-[calc(100dvh-50px)] min-h-[calc(100dvh-50px)]"
		>
			<AppSidebar />
			<Sidebar.Inset>
				<header class="absolute top-0 left-0 z-10 flex h-16 shrink-0 items-center gap-2">
					<div class="flex items-center gap-2 px-4">
						<Sidebar.Trigger class="-ml-1" />
					</div>
				</header>
				{@render children?.()}
			</Sidebar.Inset>
		</Sidebar.Provider>
	</DataStreamProvider>
</div>
