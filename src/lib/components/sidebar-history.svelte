<script lang="ts">
	import { page } from '$app/state';
	import {
		SidebarGroup,
		SidebarGroupContent,
		SidebarMenu,
		SidebarGroupLabel
	} from '$components/ui/sidebar';
	import { getChatHistory } from '$remote/chat.remote';
	import ChatItem from '$components/sidebar-history-item.svelte';
	import type { Chat } from '$server/db/schema';
	import * as Collapsible from '$components/ui/collapsible';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	let user = $derived(page.data.user);
	let id = $derived(page.params.id);
</script>

<Collapsible.Root title="Favorites" open class="group/collapsible">
	<SidebarGroup class="py-0.5">
		<SidebarGroupLabel
			class="group/label text-[13px] text-gray-500 hover:text-sidebar-accent-foreground"
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
					<div
						class="flex w-full flex-row items-center justify-center gap-2 p-2 text-xs text-zinc-500"
					>
						Favorite chats and projects that you use often.
					</div>
				</SidebarMenu>
			</SidebarGroupContent>
		</Collapsible.Content>
	</SidebarGroup>
</Collapsible.Root>
<Collapsible.Root title="Recent Chats" open class="group/collapsible">
	<SidebarGroup class="py-0.5">
		<SidebarGroupLabel
			class="group/label text-[13px] text-gray-500 hover:text-sidebar-accent-foreground"
		>
			{#snippet child({ props })}
				<Collapsible.Trigger {...props}>
					Recent Chats
					<ChevronRightIcon
						class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
				</Collapsible.Trigger>
			{/snippet}
		</SidebarGroupLabel>
		<Collapsible.Content>
			<SidebarGroupContent>
				<SidebarMenu>
					{#if !user}
						<div
							class="flex w-full flex-row items-center justify-center gap-2 p-2 text-sm text-zinc-500"
						>
							Login to save and revisit previous chats!
						</div>
					{:else}
						<svelte:boundary>
							{#snippet pending()}
								<div class="flex flex-col">
									{#each [44, 32, 28, 64, 52] as item (item)}
										<div class="flex h-8 flex-row items-center gap-2 rounded-md px-2">
											<div
												class="h-4 max-w-[var(--skeleton-width)] flex-1 rounded-md bg-sidebar-accent-foreground/10"
												style:--skeleton-width={`${item}%`}
											></div>
										</div>
									{/each}
								</div>
							{/snippet}
							{@render recentChats(await getChatHistory())}
						</svelte:boundary>
					{/if}
				</SidebarMenu>
			</SidebarGroupContent>
		</Collapsible.Content>
	</SidebarGroup>
</Collapsible.Root>

{#snippet recentChats(chats: Chat[])}
	{#if chats.length > 0}
		<div class="mt-1.5 flex flex-col gap-0.25">
			{#each chats as chat (chat.id)}
				<ChatItem {chat} active={chat.id === id} />
			{/each}
		</div>
	{:else}
		<div class="flex w-full flex-row items-center justify-center gap-2 p-2 text-xs text-zinc-500">
			Your conversations will appear here once you start chatting!
		</div>
	{/if}
{/snippet}
