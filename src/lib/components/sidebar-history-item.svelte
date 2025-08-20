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
		MoreHorizontalIcon
	} from '$components/icons.svelte';
	import { getChatHistory, getChatVisibility, updateChatVisibility } from '$remote/chat.remote';
	import { toast } from 'svelte-sonner';
	import { visibilities } from '$components/visibility-selector.svelte';

	let {
		chat,
		active,
		ondelete
	}: {
		chat: Chat;
		active: boolean;
		ondelete: (chatId: string) => void;
	} = $props();

	let sidebar = useSidebar();
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
		<DropdownMenuContent side="bottom" align="end">
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
				class="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
				onclick={() => ondelete(chat.id)}
			>
				{@render TrashIcon()}
				<span>Delete</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</SidebarMenuItem>
