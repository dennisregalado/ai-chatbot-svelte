<script lang="ts">
	import * as Sidebar from '$components/ui/sidebar/index.js';

	let { children } = $props();
</script>

<div
	class="group peer hidden text-sidebar-foreground md:block"
	data-slot="sidebar"
	data-state="collapsed"
	data-collapsible="offcanvas"
	data-variant="inset"
	data-side="left"
></div>
<Sidebar.Inset>
	{@render children()}
</Sidebar.Inset>
