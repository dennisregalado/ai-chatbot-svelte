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
	import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
	import { Button } from './ui/button';
	import PlusIcon from './icons/plus.svelte';
	// import SidebarHistory from './sidebar-history/history.svelte';
	import SidebarUserNav from './sidebar-user-nav.svelte';

 	const sidebar = useSidebar();

	function newChat() {
		sidebar.setOpenMobile(false);
		goto('/');
	}
</script>

<Sidebar class="group-data-[side=left]:border-r-0">
	<SidebarHeader>
		<SidebarMenu>
			<div class="flex flex-row items-center justify-between">
				<a
					href="/"
					onclick={() => {
						sidebar.setOpenMobile(false);
					}}
					class="flex flex-row items-center gap-3"
				>
					<span class="cursor-pointer rounded-md px-2 text-lg font-semibold hover:bg-muted"
						>Chatbot</span
					>
				</a>
				<Tooltip>
					<TooltipTrigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" type="button" class="h-fit p-2" onclick={newChat}>
								<PlusIcon />
							</Button>
						{/snippet}
					</TooltipTrigger>
					<TooltipContent align="end">New Chat</TooltipContent>
				</Tooltip>
			</div>
		</SidebarMenu>
	</SidebarHeader>
	<SidebarContent>
		<!-- <SidebarHistory /> -->
	</SidebarContent>
	<SidebarFooter>
		<SidebarUserNav />
	</SidebarFooter>
</Sidebar>
