<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import WorkspaceSwitcher from '$components/workspace-switcher.svelte';
	import { IsMobile } from '$hooks/is-mobile.svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import * as Kbd from '$components/ui/kbd';
	let { children } = $props();

	const sidebar = Sidebar.useSidebar();
	const isMobile = new IsMobile();
</script>

<Sidebar.Root variant="inset" collapsible="offcanvas">
	<Sidebar.Header>
		{#if isMobile.current}
			<WorkspaceSwitcher />
		{/if}
		<Sidebar.Menu>
			<Sidebar.MenuButton class="group/button" onclick={() => goto('/workspace')}>
				<ChevronLeftIcon />
				<span>Back to Home</span>
				<Kbd.Root class="ml-auto opacity-0 transition-opacity group-hover/button:opacity-100">⌘K</Kbd.Root>	 
			</Sidebar.MenuButton>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content></Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
<Sidebar.Inset>
	{@render children()}
</Sidebar.Inset>
