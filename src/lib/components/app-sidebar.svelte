<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import { Button } from '$components/ui/button';
	import SidebarHistory from '$components/sidebar-history.svelte';
	import ChatSearch from '$components/chat-search.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import WorkspaceSwitcher from './workspace-switcher.svelte';
	import { IsMobile } from '$hooks/is-mobile.svelte';
	import SidebarAgents from './sidebar-agents.svelte';
	import HomeIcon from '@lucide/svelte/icons/home';
	import InboxIcon from '@lucide/svelte/icons/inbox';

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
						<kbd
							class="ml-auto hidden items-center gap-1 opacity-0 transition-opacity group-hover/button:opacity-100 sm:flex"
							><kbd
								class="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm bg-gray-200/75 px-0 text-xs font-normal tracking-tight text-gray-600 tabular-nums select-none"
								>⌘</kbd
							><kbd
								class="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm bg-gray-200/75 px-0 text-xs font-normal tracking-tight text-gray-600 tabular-nums select-none"
								>K</kbd
							></kbd
						>
					</Sidebar.MenuButton>
				{/snippet}
			</ChatSearch>
			<Sidebar.MenuButton class="group/button" onclick={() => goto('/')}>
				<HomeIcon />
				<span>Home</span>
				<kbd
					class="ml-auto hidden items-center gap-1 opacity-0 transition-opacity group-hover/button:opacity-100 sm:flex"
					><kbd
						class="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm bg-gray-200/75 px-0 text-xs font-normal tracking-tight text-gray-600 tabular-nums select-none"
						>⌘</kbd
					><kbd
						class="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm bg-gray-200/75 px-0 text-xs font-normal tracking-tight text-gray-600 tabular-nums select-none"
						>K</kbd
					></kbd
				>
			</Sidebar.MenuButton>
			<Sidebar.MenuButton class="group/button" onclick={() => goto('/')}>
				<InboxIcon />
				<span>Inbox</span>
				<kbd
					class="ml-auto hidden items-center gap-1 opacity-0 transition-opacity group-hover/button:opacity-100 sm:flex"
					><kbd
						class="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm bg-gray-200/75 px-0 text-xs font-normal tracking-tight text-gray-600 tabular-nums select-none"
						>⌘</kbd
					>
					<kbd
						class="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm bg-gray-200/75 px-0 text-xs font-normal tracking-tight text-gray-600 tabular-nums select-none"
						>K</kbd
					></kbd
				>
			</Sidebar.MenuButton>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<SidebarAgents />
		<SidebarHistory />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
