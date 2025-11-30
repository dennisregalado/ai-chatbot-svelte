<script lang="ts">
	import { page } from '$app/state';

	import { getChatHistory } from '$remote/chat.remote';
	import type { Chat } from '$server/db/schema';

	import ChatItem from '$components/sidebar-history-item.svelte';
	import * as Collapsible from '$components/ui/collapsible';
	import * as Empty from '$lib/components/ui/empty/index.js';

	import {
		SidebarGroup,
		SidebarGroupContent,
		SidebarGroupLabel,
		SidebarMenu
	} from '$components/ui/sidebar';

	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	let chats = $derived(await getChatHistory());
</script>

<Collapsible.Root title="Favorites" open class="group/collapsible">
	<SidebarGroup class="py-0.5">
		<SidebarGroupLabel
			class="group/label text-[13px] text-muted-foreground hover:text-sidebar-accent-foreground"
		>
			{#snippet child({ props })}
				<Collapsible.Trigger {...props}>
					Favorites
					<ChevronRightIcon
						class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
				</Collapsible.Trigger>
			{/snippet}
		</SidebarGroupLabel>
		<Collapsible.Content>
			<SidebarGroupContent>
				<SidebarMenu>

					{#if chats.length > 0}
						{@render favoriteChats(chats)}
					{:else}
						<Empty.Description class="p-2 text-xs"
							>Your favorite chats will appear here once you favorite a chat!</Empty.Description
						>
					{/if}
				</SidebarMenu>
			</SidebarGroupContent>
		</Collapsible.Content>
	</SidebarGroup>
</Collapsible.Root>

{#snippet favoriteChats(chats: Chat[])}
	{@const filteredChats = chats.filter((chat) => chat.favorite)}

	{#if filteredChats.length > 0}
		<div class="mt-1.5 flex flex-col gap-0.25">
			{#each filteredChats as chat (chat.id)}
				<ChatItem {chat} active={chat.id === page.params.id} favorite={chat.favorite} />
			{/each}
		</div>
	{:else}
		<Empty.Description class="p-2 text-xs"
			>Favorite chats and projects that you use often.</Empty.Description
		>
	{/if}
{/snippet}

