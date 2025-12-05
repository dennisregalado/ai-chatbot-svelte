<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Snippet } from 'svelte';
	import type { ButtonProps } from './ui/button/button.svelte';
	import { getUser } from '$remote/auth.remote';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { getActiveWorkspace } from '$remote/workspace.remote';
	import SettingsSidebarNav from '$lib/components/settings-sidebar-nav.svelte';
	import AccountPage from '../../routes/(app)/[workspace]/settings/account/+page.svelte';
	import WorkspacePage from '../../routes/(app)/[workspace]/settings/workspace/+page.svelte';
	import { page } from '$app/state';
	import { pushState } from '$app/navigation';
	import { getWorkspace } from '$remote/workspace.remote';

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
	const activeWorkspace = $derived(
		page.params.workspace
			? await getWorkspace(page.params.workspace as string)
			: await getActiveWorkspace()
	);

	let open = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}

	function onNavigate(href: string) {
		pushState(href, page.state);
	}

	const currentPath = $derived(
		page.url.pathname.includes('/settings/workspace')
			? page.url.pathname
			: `/${activeWorkspace?.slug}/settings/account`
	);
</script>

<svelte:document onkeydown={handleKeydown} />

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
	<Dialog.Content class="overflow-hidden p-0 md:max-h-[500px] lg:max-w-4xl" trapFocus={false}>
		<Dialog.Title class="sr-only">Settings</Dialog.Title>
		<Dialog.Description class="sr-only">Customize your settings here.</Dialog.Description>
		<Sidebar.Provider class="items-start">
			<Sidebar.Root collapsible="none" class="hidden md:flex">
				<Sidebar.Content>
					<SettingsSidebarNav {user} {activeWorkspace} {onNavigate} {currentPath} />
				</Sidebar.Content>
			</Sidebar.Root>
			<main class="flex h-[480px] flex-1 flex-col overflow-hidden">
				{#if page.url.pathname.includes('/settings/workspace')}
					<WorkspacePage data={page.data} />
				{:else}
					<AccountPage data={page.data} />
				{/if}
			</main>
		</Sidebar.Provider>
	</Dialog.Content>
</Dialog.Root>
