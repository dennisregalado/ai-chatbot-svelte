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

	const sidebar = useSidebar();

	const activeWorkspace = $derived(await getWorkspace(page.params.workspace || ''));
</script>

<div class="w-max">
	<Sidebar.Menu>
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
					class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
					align="start"
					side={sidebar.isMobile ? 'bottom' : 'right'}
					sideOffset={4}
				>
					<DropdownMenu.Label class="text-xs text-muted-foreground">Workspaces</DropdownMenu.Label>
					<svelte:boundary>
						{#snippet pending()}
							{#each [1, 2, 3] as _}
								<DropdownMenu.Item class="gap-2 p-2" disabled>
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
								class="gap-2 p-2"
							>
								<Avatar.Root class="size-6 rounded-sm">
									<Avatar.Image
										src={`https://avatar.vercel.sh/${workspace?.slug}`}
										alt={workspace?.name}
									/>
								</Avatar.Root>
								{workspace.name}
								<DropdownMenu.Shortcut>⌘{index + 1}</DropdownMenu.Shortcut>
							</DropdownMenu.Item>
						{/each}
					</svelte:boundary>
					<DropdownMenu.Separator />
					<DropdownMenu.Item class="gap-2 p-2">
						<div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
							<PlusIcon class="size-4" />
						</div>
						<div class="font-medium text-muted-foreground">Create workspace</div>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
</div>
