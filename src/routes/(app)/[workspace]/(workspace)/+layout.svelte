<script lang="ts">
	import AppSidebar from '$components/app-sidebar.svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	let { children } = $props();
</script>

<AppSidebar />
<Sidebar.Inset>
	{@render children()}
</Sidebar.Inset>
