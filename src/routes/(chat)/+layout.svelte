<script lang="ts">
	import AppSidebar from '$components/app-sidebar.svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import DataStreamProvider from '$components/data-stream-provider.svelte';

	let { data, children } = $props();
	let { isCollapsed } = $derived(data);
</script>

<DataStreamProvider>
	<Sidebar.Provider open={!isCollapsed}>
		<AppSidebar />
		<Sidebar.Inset>
			<svelte:boundary>
				{#snippet pending()}{/snippet}
				{@render children?.()}
			</svelte:boundary>
		</Sidebar.Inset>
	</Sidebar.Provider>
</DataStreamProvider>
