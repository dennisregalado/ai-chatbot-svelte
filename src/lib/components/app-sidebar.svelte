<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import { Button } from '$components/ui/button';
	import SidebarHistory from '$components/sidebar-history.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';

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
		<Sidebar.Menu>
			<Sidebar.MenuButton class="group/button">
				<SearchIcon />
				<span>Search</span>
				<kbd
					class="ml-auto hidden items-center gap-1 opacity-0 transition-opacity group-hover/button:opacity-100 sm:flex"
					><kbd
						class="bg-gray-200/75 pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm px-0 text-xs font-normal tracking-tight text-gray-600 tabular-nums select-none"
						>⌘</kbd
					><kbd
						class="bg-gray-200/75 pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm px-0 text-xs font-normal tracking-tight text-gray-600 tabular-nums select-none"
						>K</kbd
					></kbd
				> 
			</Sidebar.MenuButton>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<SidebarHistory />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
