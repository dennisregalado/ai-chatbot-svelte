<script lang="ts" module>
	// This is sample data.
	export const data = {
		tree: [
			[
				'General Knowledge',
				['Onboarding', 'Subfolder 1', 'Subfolder 2'],
				'Integrations',
				'Documents'
			],
			'Onboarding Design',
			'Team Interviews'
		]
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import WorkspaceSwitcher from '$components/workspace-switcher.svelte';
	import { IsMobile } from '$hooks/is-mobile.svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import FileIcon from '@lucide/svelte/icons/file';
	import FolderIcon from '@lucide/svelte/icons/folder';
	import * as Kbd from '$components/ui/kbd';
	import * as Collapsible from '$components/ui/collapsible';
	import { getUser } from '$remote/auth.remote';
	import { getWorkspace } from '$remote/workspace.remote';

	let { children, params } = $props();

	const sidebar = Sidebar.useSidebar();
	const isMobile = new IsMobile();

	const user = $derived(await getUser());
	const activeWorkspace = $derived(await getWorkspace(params.workspace));
</script>

<Sidebar.Root variant="inset" collapsible="offcanvas">
	<Sidebar.Header>
		{#if isMobile.current}
			<WorkspaceSwitcher />
		{/if}
		<Sidebar.Menu>
			<Sidebar.MenuButton class="group/button" onclick={() => goto('/' + params.workspace, { invalidateAll: true })}>
				<ChevronLeftIcon />
				<span>Back to Home</span>
				<Kbd.Root class="ml-auto opacity-0 transition-opacity group-hover/button:opacity-100"
					>⌘K</Kbd.Root
				>
			</Sidebar.MenuButton>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Knowledge</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each data.tree as item, index (index)}
						{@render Tree({ item })}
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
<Sidebar.Inset>
	{@render children()}
</Sidebar.Inset>

<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
{#snippet Tree({ item }: { item: string | any[] })}
	{@const [name, ...items] = Array.isArray(item) ? item : [item]}

	{#if !items.length}
		<Sidebar.MenuButton isActive={false} class="data-[active=true]:bg-transparent">
			<FileIcon />
			{name}
		</Sidebar.MenuButton>
	{:else}
		<Sidebar.MenuItem>
			<Collapsible.Root
				class="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
				open={name === 'General Knowledge' || name === 'Onboarding'}
			>
				<Collapsible.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton {...props}>
							<ChevronRightIcon class="transition-transform" />
							<FolderIcon />
							{name}
						</Sidebar.MenuButton>
					{/snippet}
				</Collapsible.Trigger>
				<Collapsible.Content>
					<Sidebar.MenuSub>
						{#each items as subItem, index (index)}
							{@render Tree({ item: subItem })}
						{/each}
					</Sidebar.MenuSub>
				</Collapsible.Content>
			</Collapsible.Root>
		</Sidebar.MenuItem>
	{/if}
{/snippet}
