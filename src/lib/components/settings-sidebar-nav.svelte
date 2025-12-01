<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import BookIcon from '@lucide/svelte/icons/book';
	import BoxIcon from '@lucide/svelte/icons/box';
	import CircleDollarSignIcon from '@lucide/svelte/icons/circle-dollar-sign';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import UsersIcon from '@lucide/svelte/icons/users';
	import WorkflowIcon from '@lucide/svelte/icons/workflow';
	import { page } from '$app/state';
	import { getWorkspace } from '$remote/workspace.remote';
	import type { Snippet } from 'svelte';

	let {
		user,
		onNavigate,
		currentPath
	}: {
		user: any;
		onNavigate?: (href: string) => void;
		currentPath?: string;
	} = $props();

	const activePath = $derived(currentPath ?? page.url.pathname);
	const activeWorkspace = $derived(await getWorkspace(page.params.workspace as string));

	const data = {
		groups: [
			{
				label: 'Account',
				items: [{ name: user?.name, href: 'account' }]
			},
			{
				label: 'Workspace',
				items: [
					{ name: activeWorkspace?.name, href: 'workspace' },
					{ name: 'Members', icon: UsersIcon, href: 'members' },
					{ name: 'Knowledge', icon: BookIcon, href: 'knowledge' },
					{ name: 'Data model', icon: BoxIcon, href: 'data-model' },
					{ name: 'Opportunity stages', icon: WorkflowIcon, href: 'opportunity-stages' },
					{ name: 'Import history', icon: UploadIcon, href: 'import-history' },
					{ name: 'Billing', icon: CircleDollarSignIcon, href: 'billing' }
				]
			}
		]
	};
</script>

{#each data.groups as group (group.label)}
	<Sidebar.Group>
		<Sidebar.GroupLabel class="group/label ">{group.label}</Sidebar.GroupLabel>
		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#each group.items as item (item.name)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={activePath.includes(`/settings/${item.href}`)}>
							{#snippet child({ props })}
								<a
									href="/{activeWorkspace?.slug}/settings/{item.href}"
									{...props}
									onclick={(e) => {
										if (onNavigate) {
											e.preventDefault();
											onNavigate(`/${activeWorkspace?.slug}/settings/${item.href}`);
										}
									}}
								>
									{#if item.icon}
										<item.icon />
									{:else if group.label === 'Account'}
										<Avatar.Root class="size-4">
											<Avatar.Image
												src={user?.image || `https://avatar.vercel.sh/${user?.id}`}
												alt={user?.name}
											/>
										</Avatar.Root>
									{:else if group.label === 'Workspace'}
										<Avatar.Root class="size-4 rounded-sm">
											<Avatar.Image
												src={activeWorkspace?.image ||
													`https://avatar.vercel.sh/${activeWorkspace?.slug}`}
												alt={activeWorkspace?.name}
											/>
										</Avatar.Root>
									{/if}
									<span>{item.name}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.GroupContent>
	</Sidebar.Group>
{/each}
