<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { getActiveWorkspace, getWorkspace, getWorkspaces } from '$remote/workspace.remote';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { getUser } from '$remote/auth.remote';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { signOut } from '$remote/auth.remote';
	import { cn } from '$lib/utils';
	import * as Kbd from '$lib/components/ui/kbd/index.js';

	const sidebar = useSidebar();

	const activeWorkspace = $derived(
		page.params.workspace
			? await getWorkspace(page.params.workspace as string)
			: await getActiveWorkspace()
	);
	let user = $derived(await getUser());
</script>

<Sidebar.Menu class="w-max">
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						{#if activeWorkspace}
							<Avatar.Root class="size-6 rounded-sm">
								<Avatar.Image
									src={`https://avatar.vercel.sh/${activeWorkspace?.slug}`}
									alt={activeWorkspace?.name}
								/>
							</Avatar.Root>
							<div
								class="flex flex-1 items-center justify-between gap-2 text-start text-sm leading-tight"
							>
								<span class="truncate font-medium">
									{activeWorkspace.name}
								</span>
								<Badge variant="secondary" class="w-fit truncate text-xs">
									{activeWorkspace.plan}
								</Badge>
							</div>
							<ChevronsUpDownIcon class="ms-auto" />
						{/if}
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-75 rounded-lg"
				align="start"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="size-9 rounded-sm">
							<Avatar.Image
								src={`https://avatar.vercel.sh/${activeWorkspace?.slug}`}
								alt={activeWorkspace?.name}
							/>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{activeWorkspace?.name}</span>
							<span class="text-xs text-muted-foreground"> {activeWorkspace?.members} members</span>
						</div>
						<Badge variant="secondary" class="w-fit truncate text-xs">{activeWorkspace?.plan}</Badge
						>
					</div>
				</DropdownMenu.Label>

				<DropdownMenu.Separator />
				<DropdownMenu.Label class="text-xs text-muted-foreground">{user.email}</DropdownMenu.Label>
				<svelte:boundary>
					{#snippet pending()}
						{#each [1, 2, 3] as _}
							<DropdownMenu.Item class="gap-2" disabled>
								<Skeleton class="size-6 rounded-sm" />
								<Skeleton class="h-4 w-32" />
							</DropdownMenu.Item>
						{/each}
					{/snippet}
					{@const workspaces = await getWorkspaces()}
					{#each workspaces as workspace, index (workspace.name)}
						<DropdownMenu.Item
							onSelect={() => {
								goto(`/${workspace.slug}`, {
									invalidateAll: true
								});
							}}
							class="gap-2"
						>
							<Avatar.Root class="size-6 rounded-sm">
								<Avatar.Image
									src={`https://avatar.vercel.sh/${workspace?.slug}`}
									alt={workspace?.name}
								/>
							</Avatar.Root>
							{workspace.name}
							<Kbd.Root class="ml-auto">⌘{index + 1}</Kbd.Root>
						</DropdownMenu.Item>
					{/each}
				</svelte:boundary>
				<DropdownMenu.Item class="gap-2">
					<PlusIcon class="size-4" />
					Add workspace
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item class="group/button">
					{#snippet child({ props })}
						<a href="/{activeWorkspace?.slug}/settings" {...props}>
							<SettingsIcon />
							Settings
							<Kbd.Root class="ml-auto opacity-0 transition-opacity group-hover/button:opacity-100"
								>⌘S</Kbd.Root
							>
						</a>
					{/snippet}
				</DropdownMenu.Item>
				<DropdownMenu.Item disabled={signOut.pending > 0}>
					{#snippet child({ props })}
						<form {...signOut}>
							<button
								{...props}
								type="submit"
								class={cn('w-full cursor-pointer', props.class as string)}
							>
								<LogOutIcon />
								Sign out
							</button>
						</form>
					{/snippet}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
