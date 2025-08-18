<script lang="ts" module>
	import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
	import type { Chat } from '$server/db/schema';

	type GroupedChats = {
		today: Chat[];
		yesterday: Chat[];
		lastWeek: Chat[];
		lastMonth: Chat[];
		older: Chat[];
	};3

	export interface ChatHistory {
		chats: Array<Chat>;
		hasMore: boolean;
	}

	const PAGE_SIZE = 20;

	const groupChatsByDate = (chats: Chat[]): GroupedChats => {
		const now = new Date();
		const oneWeekAgo = subWeeks(now, 1);
		const oneMonthAgo = subMonths(now, 1);

		return chats.reduce(
			(groups, chat) => {
				const chatDate = new Date(chat.createdAt);

				if (isToday(chatDate)) {
					groups.today.push(chat);
				} else if (isYesterday(chatDate)) {
					groups.yesterday.push(chat);
				} else if (chatDate > oneWeekAgo) {
					groups.lastWeek.push(chat);
				} else if (chatDate > oneMonthAgo) {
					groups.lastMonth.push(chat);
				} else {
					groups.older.push(chat);
				}

				return groups;
			},
			{
				today: [],
				yesterday: [],
				lastWeek: [],
				lastMonth: [],
				older: []
			} as GroupedChats
		);
	};
</script>

<script lang="ts">
	import { page } from '$app/state';
	import { Button } from './ui/button';
	import { SidebarGroup, SidebarGroupContent } from './ui/sidebar';
	import {  getChatHistory, deleteChatById } from '$remote/chat.remote';

	let user = $derived(page.data.user);
</script>

{#if !user}
	<SidebarGroup>
		<SidebarGroupContent>
			<div
				class="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500"
			>
				Login to save and revisit previous chats!
			</div>
		</SidebarGroupContent>
	</SidebarGroup>
{:else}
	<svelte:boundary>
		{#snippet pending()}
			<SidebarGroup>
				<div class="px-2 py-1 text-xs text-sidebar-foreground/50">Today</div>
				<SidebarGroupContent>
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
				</SidebarGroupContent>
			</SidebarGroup>
		{/snippet}
	</svelte:boundary>
{/if}

{#snippet emptyChatHistory()}
	<SidebarGroup>
		<div class="px-2 py-1 text-xs text-sidebar-foreground/50">Today</div>
		<SidebarGroupContent>
			<div class="flex flex-col">
				{#each [44, 32, 28, 64, 52] as item (item)}
					<div class="flex h-8 flex-row items-center gap-2 rounded-md px-2">
						<div
							class="h-4 max-w-[--skeleton-width] flex-1 rounded-md bg-sidebar-accent-foreground/10"
							style:--skeleton-width={`${item}%`}
						></div>
					</div>
				{/each}
			</div>
		</SidebarGroupContent>
	</SidebarGroup>
{/snippet}

{#snippet chatHistory()}{/snippet}
