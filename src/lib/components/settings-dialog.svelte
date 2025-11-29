<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import BellIcon from '@lucide/svelte/icons/bell';
	import BookIcon from '@lucide/svelte/icons/book';
	import BoxIcon from '@lucide/svelte/icons/box';
	import CircleDollarSignIcon from '@lucide/svelte/icons/circle-dollar-sign';
	import MailIcon from '@lucide/svelte/icons/mail';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import UserIcon from '@lucide/svelte/icons/user';
	import UsersIcon from '@lucide/svelte/icons/users';
	import VideoIcon from '@lucide/svelte/icons/video';
	import WorkflowIcon from '@lucide/svelte/icons/workflow';
	import type { Snippet } from 'svelte';
	import type { ButtonProps } from './ui/button/button.svelte';
	import { getUser } from '$remote/auth.remote';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { getActiveWorkspace } from '$remote/workspace.remote';
	let {
		children
	}: {
		children: Snippet<
			[
				{
					size: 'icon';
					variant: 'ghost';
				} & ButtonProps
			]
		>;
	} = $props();

	const user = $derived(await getUser());
	const activeWorkspace = $derived(await getActiveWorkspace());

	const data = {
		groups: [
			{
				label: 'Account',
				items: [
					{ name: user?.name },
					{ name: 'Mail and Calendar', icon: MailIcon },
					{ name: 'Notifications', icon: BellIcon },
					{ name: 'Recording', icon: VideoIcon }
				]
			},
			{
				label: 'Workspace',
				items: [
					{ name: activeWorkspace?.name },
					{ name: 'Members', icon: UsersIcon },
					{ name: 'Knowledge', icon: BookIcon },
					{ name: 'Data model', icon: BoxIcon },
					{ name: 'Opportunity stages', icon: WorkflowIcon },
					{ name: 'Import history', icon: UploadIcon },
					{ name: 'Billing', icon: CircleDollarSignIcon }
				]
			}
		]
	};

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			{@render children?.({
				size: 'icon',
				variant: 'ghost',
				...props
			})}
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content
		class="overflow-hidden p-0 md:max-h-[500px] lg:max-w-4xl"
		trapFocus={false}
	>
	
		<Dialog.Title class="sr-only">Settings</Dialog.Title>
		<Dialog.Description class="sr-only">Customize your settings here.</Dialog.Description>
		<Sidebar.Provider class="items-start">
			<Sidebar.Root collapsible="none" class="hidden md:flex">
				<Sidebar.Content>
					{#each data.groups as group (group.label)}
						<Sidebar.Group>
							<Sidebar.GroupLabel class="group/label text-[13px] text-muted-foreground">{group.label}</Sidebar.GroupLabel>
							<Sidebar.GroupContent>
								<Sidebar.Menu>
									{#each group.items as item (item.name)}
										<Sidebar.MenuItem>
											<Sidebar.MenuButton isActive={item.name === 'Settings'}>
												{#snippet child({ props })}
													<a href="##" {...props}>
														{#if item.icon}
															<item.icon />
														{:else if group.label === 'Account'}
															<Avatar.Root class="size-4">
																	<Avatar.Image src={user?.image || `https://avatar.vercel.sh/${user?.id}`} alt={user?.name} />
																</Avatar.Root>
														 
														{:else if group.label === 'Workspace'}
															<Avatar.Root class="size-4 rounded-sm">
																<Avatar.Image src={activeWorkspace?.image || `https://avatar.vercel.sh/${activeWorkspace?.id}`} alt={activeWorkspace?.name} />
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
				</Sidebar.Content>
			</Sidebar.Root>
			<main class="flex h-[480px] flex-1 flex-col overflow-hidden">
				<header
					class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
				>
					<div class="flex items-center gap-2 px-4">
						<Breadcrumb.Root>
							<Breadcrumb.List>
								<Breadcrumb.Item class="hidden md:block">
									<Breadcrumb.Link href="##">Settings</Breadcrumb.Link>
								</Breadcrumb.Item>
								<Breadcrumb.Separator class="hidden md:block" />
								<Breadcrumb.Item>
									<Breadcrumb.Page>Settings</Breadcrumb.Page>
								</Breadcrumb.Item>
							</Breadcrumb.List>
						</Breadcrumb.Root>
					</div>
				</header>
				<div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
					{#each Array.from({ length: 10 }) as _, i (i)}
						<div class="aspect-video max-w-3xl rounded-xl bg-muted/50"></div>
					{/each}
				</div>
			</main>
		</Sidebar.Provider>
	</Dialog.Content>
</Dialog.Root>
