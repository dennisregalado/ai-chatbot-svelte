<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Sidebar,
		SidebarContent,
		SidebarFooter,
		SidebarHeader,
		SidebarMenu,
		useSidebar
	} from '$lib/components/ui/sidebar'; 
	import { Button } from './ui/button';
	import SidebarHistory from './sidebar-history.svelte';
	import SidebarUserNav from './sidebar-user-nav.svelte';

	const sidebar = useSidebar();

	function newChat() {
		sidebar.setOpenMobile(false);
		goto('/', {
			invalidateAll: true
		});
	}
</script>

<Sidebar variant="inset">
	<SidebarHeader>
		<SidebarMenu>
			<Button variant="outline" type="button" onclick={newChat}>New Chat</Button>
		</SidebarMenu>
	</SidebarHeader>
	<SidebarContent>
		<SidebarHistory />
	</SidebarContent>
	<SidebarFooter>
		<SidebarUserNav />
	</SidebarFooter>
</Sidebar>
