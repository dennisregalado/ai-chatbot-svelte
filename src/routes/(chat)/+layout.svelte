<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { SidebarInset, SidebarProvider } from '$lib/components/ui/sidebar';
	import DataStreamProvider from '$lib/components/data-stream-provider.svelte';

	let { data, children } = $props();

	let { session, isCollapsed } = $derived(data);
</script>

<DataStreamProvider>
	<SidebarProvider open={!isCollapsed}>
		<AppSidebar user={session?.user} />
		<SidebarInset>{@render children?.()}</SidebarInset>
	</SidebarProvider>
</DataStreamProvider>
