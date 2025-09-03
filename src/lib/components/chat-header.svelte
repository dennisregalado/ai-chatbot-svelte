<script lang="ts">
	import { useSidebar } from './ui/sidebar';
	import SidebarToggle from './sidebar-toggle.svelte';
	import { innerWidth } from 'svelte/reactivity/window';
	import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
	import { Button } from './ui/button';
	import { PlusIcon, VercelIcon } from './icons.svelte';
	import { goto } from '$app/navigation';
	import VisibilitySelector from './visibility-selector.svelte';

	let {
		chatId,
		readonly
	}: {
		chatId: string;
		readonly: boolean;
	} = $props();

	const sidebar = useSidebar();
</script>

<header class="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
	<SidebarToggle />

	{#if !sidebar.open || (innerWidth.current ?? 768) < 768}
		<Tooltip>
			<TooltipTrigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						class="order-2 ml-auto px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
						onclick={() => {
							sidebar.setOpenMobile(false);
							goto('/', {
								invalidateAll: true
							});
						}}
					>
						{@render PlusIcon()}
						<span class="md:sr-only">New Chat</span>
					</Button>
				{/snippet}
			</TooltipTrigger>
			<TooltipContent>New Chat</TooltipContent>
		</Tooltip>
	{/if}

	{#if !readonly}
		<VisibilitySelector {chatId} class="order-1 md:order-3" />
	{/if}
</header>
