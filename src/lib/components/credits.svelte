<script lang="ts">
	import { getCustomer } from '$remote/customer.remote';
	import { Button } from '$components/ui/button';
	import { Skeleton } from '$components/ui/skeleton';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Upgrade from '$components/upgrade.svelte';

	const customer = getCustomer();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm">
				<svelte:boundary>
					{#snippet pending()}
						<Skeleton class="h-4 w-8" />
					{/snippet}
					4.95
				</svelte:boundary>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-80" align="end" side="bottom" sideOffset={8}>
		<DropdownMenu.Label class="text-xs font-medium text-gray-500">
			Credit Balance
		</DropdownMenu.Label>
		<DropdownMenu.Group>
			<DropdownMenu.Item>
				<div class="flex w-full items-center justify-between gap-4">
					<span class="text-sm font-normal">Monthly credits</span>
					<span class="text-sm font-medium text-gray-500">4.95</span>
				</div>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<div class="flex w-full items-center justify-between gap-4">
					<span class="text-sm font-normal">Purchased credits</span>
					<span class="text-sm font-medium text-gray-500">0.00</span>
				</div>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<div class="mt-2 space-y-2">
			<Upgrade class="w-full" title="Upgrade your plan to buy more credits">Buy Credits</Upgrade>
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
