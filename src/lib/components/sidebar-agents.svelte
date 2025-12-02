<script lang="ts">
	import * as Collapsible from '$components/ui/collapsible';
	import * as Empty from '$lib/components/ui/empty/index.js';

	import {
		SidebarGroup,
		SidebarGroupContent,
		SidebarGroupLabel,
		SidebarMenu
	} from '$components/ui/sidebar';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
</script>

<Collapsible.Root title="Agents" open class="group/collapsible">
	<SidebarGroup class="py-0.5">
		<SidebarGroupLabel class="group/label hover:text-sidebar-accent-foreground">
			{#snippet child({ props })}
				<Collapsible.Trigger {...props}>
					Agents
					<ChevronRightIcon
						class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
				</Collapsible.Trigger>
			{/snippet}
		</SidebarGroupLabel>
		<Collapsible.Content>
			<SidebarGroupContent>
				<SidebarMenu>
					<Empty.Description class="p-2 text-xs"
						>Your agents will appear here once you create an agent!</Empty.Description
					>
				</SidebarMenu>
			</SidebarGroupContent>
		</Collapsible.Content>
	</SidebarGroup>
</Collapsible.Root>
