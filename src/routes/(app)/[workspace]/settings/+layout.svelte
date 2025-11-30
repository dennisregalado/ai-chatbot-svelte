<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import WorkspaceSwitcher from '$components/workspace-switcher.svelte';
	import { IsMobile } from '$hooks/is-mobile.svelte';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

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
				<kbd
					class="ml-auto hidden items-center gap-1 opacity-0 transition-opacity group-hover/button:opacity-100 sm:flex"
					><kbd
						class="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm bg-gray-200/75 px-0 text-xs font-normal tracking-tight text-gray-600 tabular-nums select-none"
						>⌘</kbd
					>
					<kbd
						class="pointer-events-none flex h-4 w-4 items-center justify-center rounded-sm bg-gray-200/75 px-0 text-xs font-normal tracking-tight text-gray-600 tabular-nums select-none"
						>K</kbd
					></kbd
				>
			</Sidebar.MenuButton>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
<Sidebar.Inset>
	{@render children()}
</Sidebar.Inset>
