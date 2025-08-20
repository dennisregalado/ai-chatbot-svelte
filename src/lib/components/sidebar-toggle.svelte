<script lang="ts">
	import { SidebarLeftIcon } from './icons.svelte';
	import { Button } from './ui/button';
	import { useSidebar } from './ui/sidebar';
	import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

	const sidebar = useSidebar();
</script>

<Tooltip>
	<TooltipTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				onclick={() => {
					sidebar.toggle();
				}}
				variant="outline"
				class="md:h-fit md:px-2"
			>
				{@render SidebarLeftIcon(16)}
			</Button>
		{/snippet}
	</TooltipTrigger>
	<TooltipContent align="start">Toggle Sidebar</TooltipContent>
</Tooltip>
