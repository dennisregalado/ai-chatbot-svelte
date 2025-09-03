<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import { Button } from '$components/ui/button';
	import SidebarHistory from '$components/sidebar-history.svelte';

	const sidebar = Sidebar.useSidebar();

	function newChat() {
		sidebar.setOpenMobile(false);
		goto('/', {
			invalidateAll: true
		});
	}
</script>

<Sidebar.Root variant="inset" collapsible="offcanvas">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Button variant="outline" type="button" onclick={newChat}>New Chat</Button>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<SidebarHistory />
	</Sidebar.Content>
</Sidebar.Root>
