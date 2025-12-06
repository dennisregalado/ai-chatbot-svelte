<script lang="ts">
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import WorkspaceSwitcher from '$components/workspace-switcher.svelte';
	import { IsMobile } from '$hooks/is-mobile.svelte';
	import ChatSearch from '$components/chat-search.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import MessageIcon from '@lucide/svelte/icons/message-circle';
	import BookIcon from '@lucide/svelte/icons/book';
	import SidebarAgents from '$components/sidebar-agents.svelte';
	import SidebarInboxes from '$components/sidebar-inboxes.svelte';
	import * as Kbd from '$components/ui/kbd';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import UsersIcon from '@lucide/svelte/icons/users';
	import HomeIcon from '@lucide/svelte/icons/home';
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
						<Kbd.Root class="ml-auto opacity-0 transition-opacity group-hover/button:opacity-100"
							>⌘K</Kbd.Root
						>
					</Sidebar.MenuButton>
				{/snippet}
			</ChatSearch>
			<Sidebar.MenuButton class="group/button" onclick={() => goto(`/${page.params.workspace}`)}>
				<HomeIcon />
				<span>Home</span>
			</Sidebar.MenuButton>
			<Sidebar.MenuButton
				class="group/button"
				onclick={() => goto(`/${page.params.workspace}/chat`)}
			>
				<MessageIcon />
				<span>Chat</span>
			</Sidebar.MenuButton>
			<Sidebar.MenuButton
				class="group/button"
				onclick={() => goto(`/${page.params.workspace}/knowledge`)}
			>
				<BookIcon />
				<span>Knowledge</span>
			</Sidebar.MenuButton>
			<Sidebar.MenuButton
				class="group/button"
				onclick={() => goto(`/${page.params.workspace}/people`)}
			>
				<UsersIcon />
				<span>People</span>
			</Sidebar.MenuButton>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<SidebarInboxes />
		<SidebarAgents />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
<Sidebar.Inset>
	{@render children()}
</Sidebar.Inset>
