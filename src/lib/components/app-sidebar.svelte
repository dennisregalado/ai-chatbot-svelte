<script lang="ts" module>
	// sample data
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Sidebar,
		SidebarContent,
		SidebarFooter,
		SidebarHeader,
		SidebarMenu,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupContent,
		SidebarMenuItem,
		SidebarMenuButton,
		useSidebar
	} from '$lib/components/ui/sidebar';
	import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
	import { Button } from './ui/button';
	import { PlusIcon } from './icons.svelte';
	import SidebarHistory from './sidebar-history.svelte';
	import SidebarUserNav from './sidebar-user-nav.svelte';
	import * as Collapsible from '$components/ui/collapsible';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	const sidebar = useSidebar();

	function newChat() {
		sidebar.setOpenMobile(false);
		goto('/');
	}
</script>

<Sidebar  variant="inset">
	<SidebarHeader>
		<SidebarMenu>
			<div class="flex w-full flex-row items-center justify-between">
				<button
					onclick={() => {
						sidebar.setOpenMobile(false);
						goto('/', {
							invalidateAll: true
						});
					}}
					class="flex hidden flex-row items-center gap-3"
				>
					<span class="cursor-pointer rounded-md px-2 text-lg font-semibold hover:bg-muted"
						>Chatbot</span
					>
				</button>
			</div>
			<Tooltip>
				<TooltipTrigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" type="button" onclick={newChat}>New Chat</Button>
					{/snippet}
				</TooltipTrigger>
				<TooltipContent align="end">New Chat</TooltipContent>
			</Tooltip>
		</SidebarMenu>
	</SidebarHeader>
	<SidebarContent>
		<SidebarHistory />
	</SidebarContent>
	<SidebarFooter>
		<SidebarUserNav />
	</SidebarFooter>
</Sidebar>
