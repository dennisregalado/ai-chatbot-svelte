<script lang="ts">
	import AppSidebar from '$components/app-sidebar.svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import WorkspaceSwitcher from '$components/workspace-switcher.svelte';
	import { IsMobile } from '$hooks/is-mobile.svelte';
	import { Button } from '$components/ui/button';
	import ChatSearch from '$components/chat-search.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import HomeIcon from '@lucide/svelte/icons/home';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import SidebarFavorites from '$components/sidebar-favorites.svelte';
	import SidebarAgents from '$components/sidebar-agents.svelte';
	import SidebarHistory from '$components/sidebar-history.svelte';
	import * as Kbd from '$components/ui/kbd';
	let { children } = $props();

	const isMobile = new IsMobile();
</script>

<Sidebar.Root variant="inset" collapsible="offcanvas">
	<Sidebar.Header>
		{#if isMobile.current}
			<WorkspaceSwitcher />
		{/if}
		<Sidebar.Menu>
			<ChatSearch>
				{#snippet children({ toggle })}
					<Sidebar.MenuButton class="group/button" onclick={toggle}>
						<SearchIcon />
						<span>Search</span>
						<Kbd.Root class="ml-auto opacity-0 transition-opacity group-hover/button:opacity-100">⌘K</Kbd.Root>	 
					</Sidebar.MenuButton>
				{/snippet}
			</ChatSearch>
			<Sidebar.MenuButton class="group/button" onclick={() => goto('/')}>
				<HomeIcon />
				<span>Home</span>
			</Sidebar.MenuButton>
			<Sidebar.MenuButton class="group/button" onclick={() => goto('/')}>
				<InboxIcon />
				<span>Inbox</span>
			</Sidebar.MenuButton>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<SidebarFavorites />
		<SidebarAgents />
		<SidebarHistory />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
<Sidebar.Inset>
	{@render children()}
</Sidebar.Inset>
