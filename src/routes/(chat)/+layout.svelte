<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { SidebarInset, SidebarProvider } from '$lib/components/ui/sidebar'; 
	import DataStreamProvider from '$lib/components/data-stream-provider.svelte';

	let { data, children } = $props();
 
</script>

<DataStreamProvider>
	<SidebarProvider open={!data.isCollapsed}>
		<AppSidebar user={data.user} />
		<SidebarInset>{@render children?.()}</SidebarInset>
	</SidebarProvider>
</DataStreamProvider>
