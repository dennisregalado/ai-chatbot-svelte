<script lang="ts">
	import * as Collapsible from '$components/ui/collapsible';
	import {
		SidebarGroup,
		SidebarGroupContent,
		SidebarGroupLabel,
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton
	} from '$components/ui/sidebar';

	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import BuildingIcon from '@lucide/svelte/icons/building';
	import UserIcon from '@lucide/svelte/icons/user';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';

	const data = {
		name: 'Records',
		href: 'records',
		items: [
			{
				name: 'Companies',
				href: 'companies',
				icon: BuildingIcon
			},
			{
				name: 'People',
				href: 'people',
				icon: UserIcon
			},
			{
				name: 'Accounts',
				href: 'accounts',
				icon: CreditCardIcon
			}
		]
	};
</script>

<Collapsible.Root title="Records" open class="group/collapsible">
	<SidebarGroup class="py-0.5">
		<SidebarGroupLabel class="group/label hover:text-sidebar-accent-foreground">
			{#snippet child({ props })}
				<Collapsible.Trigger {...props}>
					Records
					<ChevronRightIcon
						class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
					/>
				</Collapsible.Trigger>
			{/snippet}
		</SidebarGroupLabel>
		<Collapsible.Content>
			<SidebarGroupContent>
				<SidebarMenu>
					{#each data.items as item}
						<SidebarMenuItem>
							<SidebarMenuButton href={item.href}>
								<item.icon />
								{item.name}</SidebarMenuButton
							>
						</SidebarMenuItem>
					{/each}
				</SidebarMenu>
			</SidebarGroupContent>
		</Collapsible.Content>
	</SidebarGroup>
</Collapsible.Root>
