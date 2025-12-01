<script lang="ts">
	import { page } from '$app/state';

	import { getChatHistory } from '$remote/chat.remote';
	import type { Chat } from '$server/db/schema';

	import ChatItem from '$components/sidebar-history-item.svelte';
	import * as Collapsible from '$components/ui/collapsible';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import {
		SidebarGroup,
		SidebarGroupContent,
		SidebarGroupLabel,
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton
	} from '$components/ui/sidebar';

	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	let chats = $derived(await getChatHistory());

	const data = {
		name: 'Records',
		href: 'records',
		items: [
			{
				name: 'Accounts',
				href: 'accounts'
			},
			{
				name: 'Contacts',
				href: 'contacts'
			},
			{
				name: 'Opportunities',
				href: 'opportunities'
			}
		]
	};
</script>

<Collapsible.Root title="Records" open class="group/collapsible">
	<SidebarGroup class="py-0.5">
		<SidebarGroupLabel class="group/label hover:text-sidebar-accent-foreground">
			{#snippet child({ props })}
				<Collapsible.Trigger {...props}>
					Records
					<ChevronRightIcon
						class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
				</Collapsible.Trigger>
			{/snippet}
		</SidebarGroupLabel>
		<Collapsible.Content>
			<SidebarGroupContent>
				<SidebarMenu>
					{#each data.items as item}
						<SidebarMenuItem>
							<SidebarMenuButton href={item.href}>{item.name}</SidebarMenuButton>
						</SidebarMenuItem>
					{/each}
				</SidebarMenu>
			</SidebarGroupContent>
		</Collapsible.Content>
	</SidebarGroup>
</Collapsible.Root>
