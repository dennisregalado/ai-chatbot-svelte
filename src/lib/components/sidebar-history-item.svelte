<script lang="ts">
	import { goto } from '$app/navigation';

	import type { Chat } from '$server/db/schema';

	import {
		getChatHistory,
		updateChatFavorite,
		updateChatVisibility,
		updateChatTitle,
		deleteChatById
	} from '$remote/chat.remote';

	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$components/ui/alert-dialog';
	import { Button } from '$components/ui/button';
	import * as Dialog from '$components/ui/dialog';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$components/ui/dropdown-menu';
	import { Input } from '$components/ui/input';
	import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
	import { useSidebar } from './ui/sidebar';

	import {
		MoreHorizontalIcon,
		PencilEditIcon,
		ShareIcon,
		TrashIcon
	} from '$components/icons.svelte';

	import { toast } from 'svelte-sonner';

	import StarFillIcon from '@lucide/svelte/icons/star-off';
	import StarIcon from '@lucide/svelte/icons/star';
	let {
		chat,
		active,
		favorite
	}: {
		chat: Chat;
		active: boolean;
		favorite: boolean;
	} = $props();

	let sidebar = useSidebar();

	let editTitle = $state(chat.title);
	let isEditing = $state(false);
	let isDeleting = $state(false);

	async function onrename() {
		if (editTitle.trim() === '' || editTitle === chat.title) {
			isEditing = false;
			editTitle = chat.title;
			return;
		}

		try {
			await updateChatTitle({
				chatId: chat.id,
				title: editTitle.trim()
			}).updates(
				getChatHistory().withOverride((chats) =>
					chats.map((c) => (c.id === chat.id ? { ...c, title: editTitle.trim() } : c))
				)
			);
			isEditing = false;
			toast.success('Chat renamed successfully');
		} catch (error) {
			toast.error('Failed to rename chat');
			editTitle = chat.title;
			isEditing = false;
		}
	}

	async function ondelete() {
		try {
			const deletePromise = deleteChatById(chat.id).updates(
				getChatHistory().withOverride((chats) => chats.filter((c) => c.id !== chat.id))
			);
			toast.promise(deletePromise, {
				loading: 'Deleting chat...',
				success: 'Chat deleted successfully',
				error: 'Failed to delete chat'
			});

			isDeleting = false;

			if (active) {
				goto('/');
			}
		} catch (error) {
			console.error(error);
			toast.error('Failed to delete chat');
		}
	}
</script>

<SidebarMenuItem>
	<SidebarMenuButton isActive={active}>
		{#snippet child({ props })}
			<a {...props} href={`/chat/${chat.id}`} onclick={() => sidebar.setOpenMobile(false)}>
				<span>{chat.title}</span>
			</a>
		{/snippet}
	</SidebarMenuButton>
	<DropdownMenu>
		<DropdownMenuTrigger>
			{#snippet child({ props })}
				<SidebarMenuAction
					{...props}
					class="mr-0.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					showOnHover={!active}
				>
					{@render MoreHorizontalIcon()}
					<span class="sr-only">More</span>
				</SidebarMenuAction>
			{/snippet}
		</DropdownMenuTrigger>
		<DropdownMenuContent side="right" align="start">
			<DropdownMenuItem
				class="cursor-pointer"
				onclick={async () => {
					try {
						updateChatVisibility({
							chatId: chat.id,
							visibility: 'public'
						}).updates(
							getChatHistory().withOverride((chats) =>
								chats.map((c) => (c.id === chat.id ? { ...c, visibility: 'public' } : c))
							)
						);
						navigator.clipboard.writeText(window.location.origin + `/chat/${chat.id}`);
						toast.success(
							'Copied link to clipboard. Shared links can be viewed by anyone with the link.'
						);
					} catch (error) {
						toast.error('Failed to share chat');
					}
				}}
			>
				{@render ShareIcon()}
				<span>Share</span>
			</DropdownMenuItem>
			<DropdownMenuItem
				class="cursor-pointer"
				onclick={() => {
					isEditing = true;
				}}
			>
				{@render PencilEditIcon()}
				<span>Rename</span>
			</DropdownMenuItem>
			<DropdownMenuItem
				class="cursor-pointer"
				onclick={async () => {
					await updateChatFavorite({
						chatId: chat.id,
						favorite: !favorite
					}).updates(
						getChatHistory().withOverride((chats) =>
							chats.map((c) => (c.id === chat.id ? { ...c, favorite: !favorite } : c))
						)
					);
				}}
			>
				{#if favorite}
					<StarFillIcon />
				{:else}
					<StarIcon />
				{/if}
				<span>{favorite ? 'Unfavorite' : 'Favorite'}</span>
			</DropdownMenuItem>
			<DropdownMenuItem
				class="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
				onclick={() => (isDeleting = true)}
			>
				{@render TrashIcon()}
				<span>Delete</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</SidebarMenuItem>

<Dialog.Root open={isEditing}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Rename Chat</Dialog.Title>
		</Dialog.Header>
		<Input bind:value={editTitle} autofocus maxlength={255} />
		<Dialog.Footer>
			<Button type="submit" onclick={onrename} disabled={updateChatTitle.pending > 0}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog open={isDeleting}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete chat?</AlertDialogTitle>
			<AlertDialogDescription>
				This action cannot be undone. This will permanently delete your chat and remove it from our
				servers.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction
				variant="destructive"
				onclick={ondelete}
				disabled={deleteChatById.pending > 0}>Delete</AlertDialogAction
			>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
