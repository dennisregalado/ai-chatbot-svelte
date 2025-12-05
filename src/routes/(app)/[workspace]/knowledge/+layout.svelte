<script lang="ts" module>
	// Helper function to convert name to URL-safe path segment
	function slugify(name: string): string {
		return name
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '') // Remove special characters
			.replace(/\s+/g, '-') // Replace spaces with hyphens
			.replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
	}

	// Helper function to build path from parent path and name
	function buildPath(parentPath: string | null, name: string): string {
		const slug = slugify(name);
		return parentPath ? `${parentPath}/${slug}` : slug;
	}

	// Type definitions for tree structure
	type TreeNode = {
		name: string;
		path: string;
		type: 'folder' | 'file';
		children?: TreeNode[];
	};

	// Helper function to convert nested array structure to tree nodes
	function arrayToTree(item: string | any[], parentPath: string | null = null): TreeNode {
		if (Array.isArray(item)) {
			const [name, ...children] = item;
			const path = buildPath(parentPath, name);
			const childNodes: TreeNode[] = [];

			// Process children
			for (const child of children) {
				if (Array.isArray(child)) {
					// Nested folder: first element is folder name, rest are children
					const [folderName, ...folderChildren] = child;
					const folderPath = buildPath(path, folderName);
					const folderChildNodes: TreeNode[] = [];

					// Process folder's children
					for (const folderChild of folderChildren) {
						if (Array.isArray(folderChild)) {
							// Nested subfolder
							folderChildNodes.push(arrayToTree(folderChild, folderPath));
						} else if (typeof folderChild === 'string') {
							// File in folder
							folderChildNodes.push({
								name: folderChild,
								path: buildPath(folderPath, folderChild),
								type: 'file'
							});
						}
					}

					childNodes.push({
						name: folderName,
						path: folderPath,
						type: 'folder',
						children: folderChildNodes.length > 0 ? folderChildNodes : undefined
					});
				} else if (typeof child === 'string') {
					// File or folder (treat as file for now)
					childNodes.push({
						name: child,
						path: buildPath(path, child),
						type: 'file'
					});
				}
			}

			return {
				name,
				path,
				type: 'folder',
				children: childNodes.length > 0 ? childNodes : undefined
			};
		} else {
			// Single string item (file)
			return {
				name: item,
				path: buildPath(parentPath, item),
				type: 'file'
			};
		}
	}

	// This is sample data - will be replaced with R2 bucket data later
	export const data = {
		tree: [
			arrayToTree([
				'General Knowledge',
				['Onboarding', 'Subfolder 1', 'Subfolder 2'],
				'Integrations',
				'Documents'
			]),
			arrayToTree('Onboarding Design'),
			arrayToTree('Team Interviews')
		] as TreeNode[]
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
	import { Separator } from '$components/ui/separator/index.js';
	import * as Breadcrumb from '$components/ui/breadcrumb/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CloudIcon from '@lucide/svelte/icons/cloud';
	import UrlDialog from '$lib/components/knowledge/url-dialog.svelte';
	import FilesDialog from '$lib/components/knowledge/files-dialog.svelte';
	import TextDialog from '$lib/components/knowledge/text-dialog.svelte';

	let { children, params } = $props();

	const isMobile = new IsMobile();

	let hasKnowledge = true;
</script>

<Sidebar.Root variant="inset" collapsible="offcanvas">
	<Sidebar.Header>
		{#if isMobile.current}
			<WorkspaceSwitcher />
		{/if}
		<Sidebar.Menu>
			<Sidebar.MenuButton
				class="group/button"
				onclick={() => goto('/' + params.workspace, { invalidateAll: true })}
			>
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

			{#if !hasKnowledge}
				<Empty.Root class="border border-dashed">
					<Empty.Header>
						<Empty.Media variant="icon">
							<CloudIcon />
						</Empty.Media>
						<Empty.Title>Cloud Storage Empty</Empty.Title>
						<Empty.Description>
							Upload files to your cloud storage to access them anywhere.
						</Empty.Description>
					</Empty.Header>
					<Empty.Content>
						<Button variant="outline" size="sm">Upload Files</Button>
					</Empty.Content>
				</Empty.Root>
			{:else}
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each data.tree as item, index (item.path)}
							{@render Tree({ item, workspace: params.workspace })}
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			{/if}
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
<Sidebar.Inset>
	<header class="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
		<div class="flex items-center gap-2">
			<Sidebar.Trigger class="-ms-1" />
			<Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item class="hidden md:block">
						<Breadcrumb.Link href="##">Knowledge Base</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator class="hidden md:block" />
					<Breadcrumb.Item>
						<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</div>
		<div class="flex items-center gap-3">
			<UrlDialog />
			<FilesDialog />
			<TextDialog />
		</div>
	</header>
	{@render children()}
</Sidebar.Inset>

{#snippet Tree({
	item,
	workspace
}: {
	item: {
		name: string;
		path: string;
		type: 'folder' | 'file';
		children?: { name: string; path: string; type: 'folder' | 'file'; children?: any[] }[];
	};
	workspace: string;
})}
	{@const hasChildren = item.children && item.children.length > 0}
	{@const href = `/${workspace}/knowledge/${item.path}`}

	{#if item.type === 'file' || !hasChildren}
		<Sidebar.MenuButton
			onclick={() => goto(href)}
			isActive={false}
			class="data-[active=true]:bg-transparent"
		>
			<FileIcon />
			{item.name}
		</Sidebar.MenuButton>
	{:else}
		<Sidebar.MenuItem>
			<Collapsible.Root
				class="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
				open={item.name === 'General Knowledge' || item.name === 'Onboarding'}
			>
				<Collapsible.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton {...props} onclick={() => goto(href)}>
							<ChevronRightIcon class="transition-transform" />
							<FolderIcon />
							{item.name}
						</Sidebar.MenuButton>
					{/snippet}
				</Collapsible.Trigger>
				<Collapsible.Content>
					<Sidebar.MenuSub>
						{#each item.children as subItem, index (subItem.path)}
							{@render Tree({ item: subItem, workspace })}
						{/each}
					</Sidebar.MenuSub>
				</Collapsible.Content>
			</Collapsible.Root>
		</Sidebar.MenuItem>
	{/if}
{/snippet}
