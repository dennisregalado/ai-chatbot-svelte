<script lang="ts">
	import type { Chat } from '$server/db/schema';
	import { useSidebar } from './ui/sidebar';
	import { SidebarMenuButton, SidebarMenuItem, SidebarMenuAction } from './ui/sidebar';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSub,
		DropdownMenuSubTrigger,
		DropdownMenuSubContent
	} from './ui/dropdown-menu';
	import {
		TrashIcon,
		GlobeIcon,
		CheckCircleFillIcon,
		LockIcon,
		ShareIcon,
		MoreHorizontalIcon,
		PencilEditIcon
	} from '$components/icons.svelte';
	import {
		getChatHistory,
		getChatVisibility,
		updateChatVisibility,
		updateChatTitle,
		deleteChatById
	} from '$remote/chat.remote';
	import { toast } from 'svelte-sonner';
	import { visibilities } from '$components/visibility-selector.svelte';
	import { Input } from '$components/ui/input';
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
	import { goto } from '$app/navigation';
	let {
		chat,
		active
	}: {
		chat: Chat;
		active: boolean;
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
			<DropdownMenuSub>
				<DropdownMenuSubTrigger class="cursor-pointer">
					{@render ShareIcon()}
					<span>Share</span>
				</DropdownMenuSubTrigger>
				<DropdownMenuSubContent>
					{#each visibilities as visibility (visibility.id)}
						<DropdownMenuItem
							onSelect={async () => {
								try {
									await updateChatVisibility({
										chatId: chat.id,
										visibility: visibility.id
									}).updates(
										getChatHistory().withOverride((chats) =>
											chats.map((c) => (c.id === chat.id ? { ...c, visibility: visibility.id } : c))
										),
										getChatVisibility(chat.id).withOverride(() => visibility.id)
									);
								} catch (error) {
									toast.error('Failed to update chat visibility');
								}
							}}
							class="cursor-pointer flex-row justify-between"
						>
							<div class="flex flex-row items-center gap-2">
								{#if visibility.id === 'public'}
									{@render GlobeIcon()}
								{:else}
									{@render LockIcon(12)}
								{/if}
								<span>{visibility.label}</span>
							</div>
							{#if visibility.id === chat.visibility}
								{@render CheckCircleFillIcon()}
							{/if}
						</DropdownMenuItem>
					{/each}
				</DropdownMenuSubContent>
			</DropdownMenuSub>
			<DropdownMenuItem
				class="cursor-pointer"
				onclick={() => {
					isEditing = true;
				}}
			>
				{@render PencilEditIcon()}
				<span>Rename</span>
			</DropdownMenuItem>
			<DropdownMenuItem class="cursor-pointer" onclick={() => {}}>
				{@render PencilEditIcon()}
				<span>Favorite</span>
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
			<AlertDialogAction variant="destructive" onclick={ondelete}>Delete</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

<AlertDialog open={isEditing}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Rename Chat</AlertDialogTitle>
		</AlertDialogHeader>
		<Input bind:value={editTitle} autofocus maxlength={255} />
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction onclick={onrename}>Save</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
