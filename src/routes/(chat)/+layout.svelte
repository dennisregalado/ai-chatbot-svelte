<script lang="ts">
	import AppSidebar from '$components/app-sidebar.svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';

	import DataStreamProvider from '$components/data-stream-provider.svelte';

	let { data, children } = $props();

	let { user, isCollapsed } = $derived(data);
</script>

<DataStreamProvider>
	<Sidebar.Provider open={!isCollapsed}>
		<AppSidebar user={user} />
		<Sidebar.Inset>
			{@render children?.()}
		</Sidebar.Inset>
	</Sidebar.Provider>
</DataStreamProvider>
