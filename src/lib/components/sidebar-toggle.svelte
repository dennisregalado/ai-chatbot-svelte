<script lang="ts">
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
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
				<PanelLeftIcon class="size-4" />
			</Button>
		{/snippet}
	</TooltipTrigger>
	<TooltipContent align="start">Toggle Sidebar</TooltipContent>
</Tooltip>
