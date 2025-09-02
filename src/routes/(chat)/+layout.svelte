<script lang="ts">
	import AppSidebar from '$components/app-sidebar.svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import DataStreamProvider from '$components/data-stream-provider.svelte';
	import { Separator } from '$components/ui/separator';
	import * as Breadcrumb from '$components/ui/breadcrumb';

	let { data, children } = $props();
	let { isCollapsed } = $derived(data);
</script>

<DataStreamProvider>
	<Sidebar.Provider open={!isCollapsed}>
		<AppSidebar />
		<Sidebar.Inset>
			<header class="absolute top-0 left-0 flex h-16 shrink-0 items-center gap-2">
				<div class="flex items-center gap-2 px-4">
					<Sidebar.Trigger class="-ml-1" />
				</div>
			</header>
			{@render children?.()}
		</Sidebar.Inset>
	</Sidebar.Provider>
</DataStreamProvider>
