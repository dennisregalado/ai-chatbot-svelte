<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import { Button } from '$components/ui/button';
	import SidebarHistory from '$components/sidebar-history.svelte';
	import SidebarChat from '$components/sidebar-chat.svelte';
	import ChatSearch from '$components/chat-search.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import WorkspaceSwitcher from './workspace-switcher.svelte';
	import { IsMobile } from '$hooks/is-mobile.svelte';
	import SidebarAgents from './sidebar-agents.svelte';
	import HomeIcon from '@lucide/svelte/icons/home';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import * as Kbd from '$components/ui/kbd';

	const sidebar = Sidebar.useSidebar();
	const isMobile = new IsMobile();

	function newChat() {
		sidebar.setOpenMobile(false);
		goto('/', {
			invalidateAll: true
		});
	}
</script>

<Sidebar.Root variant="inset" collapsible="offcanvas">
	<Sidebar.Header>
		{#if isMobile.current}
			<WorkspaceSwitcher />
		{/if}
		<Sidebar.Menu>
			<Button variant="outline" type="button" onclick={newChat}>New Chat</Button>
		</Sidebar.Menu>
		<Sidebar.Menu>
			<ChatSearch>
				{#snippet children({ toggle })}
					<Sidebar.MenuButton class="group/button" onclick={toggle}>
						<SearchIcon />
						<span>Search</span>
						<Kbd.Root class="ml-auto">⌘K</Kbd.Root>
					</Sidebar.MenuButton>
				{/snippet}
			</ChatSearch>
			<Sidebar.MenuButton class="group/button" onclick={() => goto('/')}>
				<HomeIcon />
				<span>Home</span>
				<Kbd.Root class="ml-auto">⌘1</Kbd.Root>
			</Sidebar.MenuButton>
			<Sidebar.MenuButton class="group/button" onclick={() => goto('/')}>
				<InboxIcon />
				<span>Knowledge</span>
				<Kbd.Root class="ml-auto">⌘2</Kbd.Root>
			</Sidebar.MenuButton>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<SidebarRecords />
		<SidebarAgents />
		<SidebarHistory />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
