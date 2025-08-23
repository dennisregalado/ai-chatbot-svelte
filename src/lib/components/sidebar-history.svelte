<script lang="ts" module>
	import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
	import type { Chat } from '$server/db/schema';

	type GroupedChats = {
		today: Chat[];
		yesterday: Chat[];
		lastWeek: Chat[];
		lastMonth: Chat[];
		older: Chat[];
	};

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
	import { SidebarGroup, SidebarGroupContent } from '$components/ui/sidebar';
	import { getChatHistory, deleteChatById } from '$remote/chat.remote';
	import ChatItem from '$components/sidebar-history-item.svelte';
	import { SidebarMenu } from '$components/ui/sidebar';
	import {
		AlertDialog,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogCancel,
		AlertDialogAction
	} from '$components/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let user = $derived(page.data.user);

	let deleteId = $state<string | null>(null);
	let showDeleteDialog = $state(false);
	let id = $derived(page.params.id);

	async function handleDelete() {
		if (!deleteId) return;

		try {
			const deletePromise = deleteChatById(deleteId).updates(
				getChatHistory().withOverride((chats) => chats.filter((chat) => chat.id !== deleteId))
			);
			toast.promise(deletePromise, {
				loading: 'Deleting chat...',
				success: 'Chat deleted successfully',
				error: 'Failed to delete chat'
			});

			showDeleteDialog = false;

			if (deleteId === id) {
				goto('/');
			}
		} catch (error) {
			console.error(error);
			toast.error('Failed to delete chat');
		}
	}
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
		{@render chatHistory(await getChatHistory())}
	</svelte:boundary>
{/if}

{#snippet emptyChatHistory()}
	<SidebarGroup>
		<SidebarGroupContent>
			<div
				class="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500"
			>
				Your conversations will appear here once you start chatting!
			</div>
		</SidebarGroupContent>
	</SidebarGroup>
{/snippet}

{#snippet chatHistory(chats: Chat[])}
	{#if chats.length > 0}
		{@const groupedChats = groupChatsByDate(chats)}

		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					<div class="flex flex-col gap-6">
						{#if groupedChats.today.length > 0}
							<div>
								<div class="px-2 py-1 text-xs text-sidebar-foreground/50">Today</div>
								{#each groupedChats.today as chat (chat.id)}
									<ChatItem
										{chat}
										active={chat.id === id}
										ondelete={(chatId) => {
											deleteId = chatId;
											showDeleteDialog = true;
										}}
									/>
								{/each}
							</div>
						{/if}

						{#if groupedChats.yesterday.length > 0}
							<div>
								<div class="px-2 py-1 text-xs text-sidebar-foreground/50">Yesterday</div>
								{#each groupedChats.yesterday as chat (chat.id)}
									<ChatItem
										{chat}
										active={chat.id === id}
										ondelete={(chatId) => {
											deleteId = chatId;
											showDeleteDialog = true;
										}}
									/>
								{/each}
							</div>
						{/if}

						{#if groupedChats.lastWeek.length > 0}
							<div>
								<div class="px-2 py-1 text-xs text-sidebar-foreground/50">Last 7 days</div>
								{#each groupedChats.lastWeek as chat (chat.id)}
									<ChatItem
										{chat}
										active={chat.id === id}
										ondelete={(chatId) => {
											deleteId = chatId;
											showDeleteDialog = true;
										}}
									/>
								{/each}
							</div>
						{/if}

						{#if groupedChats.lastMonth.length > 0}
							<div>
								<div class="px-2 py-1 text-xs text-sidebar-foreground/50">Last 30 days</div>
								{#each groupedChats.lastMonth as chat (chat.id)}
									<ChatItem
										{chat}
										active={chat.id === id}
										ondelete={(chatId) => {
											deleteId = chatId;
											showDeleteDialog = true;
										}}
									/>
								{/each}
							</div>
						{/if}

						{#if groupedChats.older.length > 0}
							<div>
								<div class="px-2 py-1 text-xs text-sidebar-foreground/50">
									Older than last month
								</div>
								{#each groupedChats.older as chat (chat.id)}
									<ChatItem
										{chat}
										active={chat.id === id}
										ondelete={(chatId) => {
											deleteId = chatId;
											showDeleteDialog = true;
										}}
									/>
								{/each}
							</div>
						{/if}
					</div>
				</SidebarMenu>
				<div
					class="mt-8 flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500"
				>
					You have reached the end of your chat history.
				</div>
			</SidebarGroupContent>
		</SidebarGroup>
		<AlertDialog open={showDeleteDialog}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your chat and remove it from
						our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onclick={handleDelete}>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	{:else}
		{@render emptyChatHistory()}
	{/if}
{/snippet}
