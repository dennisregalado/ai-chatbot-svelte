<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { getChatHistory } from '$remote/chat.remote';
	import type { Chat } from '$server/db/schema';

	import * as Command from '$components/ui/command';
	import { useSidebar } from '$components/ui/sidebar';

	import { MessageIcon } from '$components/icons.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import { formatDistanceToNow } from 'date-fns';
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		children
	}: { open?: boolean; children?: Snippet<[{ toggle: () => void }]> } = $props();

	let user = $derived(page.data.user);
	let sidebar = useSidebar();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}

	function selectChat(chat: Chat) {
		open = false;
		sidebar.setOpenMobile(false);
		goto(`/chat/${chat.id}`);
	}

	function newChat() {
		open = false;
		sidebar.setOpenMobile(false);
		goto('/', {
			invalidateAll: true
		});
	}

	function formatDate(date: Date) {
		return formatDistanceToNow(date, { addSuffix: true });
	}

	function toggle() {
		open = !open;
	}
</script>

<svelte:document onkeydown={handleKeydown} />

{@render children?.({ toggle })}

<Command.Dialog bind:open>
	<Command.Input placeholder="Search chats..." />
	<Command.List>
		<Command.Empty>No chats found.</Command.Empty>

		<Command.Group>
			<Command.Item onSelect={newChat}>
				<PlusIcon class="mr-2 size-4" />
				<span>New Chat</span>
			</Command.Item>
		</Command.Group>

		{#if user}
			<svelte:boundary>
				{#snippet pending()}
					<Command.Group heading="Recent Chats">
						{#each [1, 2, 3] as item (item)}
							<Command.Item disabled>
								{@render MessageIcon(14)}
								<div class="flex flex-1">
									<div class="h-4 flex-1 animate-pulse rounded bg-gray-200"></div>
								</div>
							</Command.Item>
						{/each}
					</Command.Group>
				{/snippet}
				{@render chatResults(await getChatHistory())}
			</svelte:boundary>
		{:else}
			<Command.Group heading="Authentication">
				<Command.Item disabled>
					{@render MessageIcon(14)}
					<span>Login to access your chat history</span>
				</Command.Item>
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>

{#snippet chatResults(chats: Chat[])}
	{#if chats.length > 0}
		<Command.Group heading="Recent Chats">
			{#each chats as chat (chat.id)}
				<Command.Item onSelect={() => selectChat(chat)} value={chat.title}>
					{@render MessageIcon(14)}
					<div class="flex items-center max-md:flex-col max-md:items-start flex-wrap w-full justify-between">
						<span class="truncate">{chat.title}</span>
						<span class="text-xs text-muted-foreground">
							{formatDate(new Date(chat.createdAt))}
						</span>
					</div>
				</Command.Item>
			{/each}
		</Command.Group>
	{/if}
{/snippet}
