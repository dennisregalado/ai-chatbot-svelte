<script lang="ts">
	import { getMonthlyCredits } from '$remote/customer.remote';
	import { Button, type ButtonProps } from '$components/ui/button';
	import { Skeleton } from '$components/ui/skeleton';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Upgrade from '$components/upgrade.svelte';

	let { variant = 'outline', size = 'sm', ...buttonProps }: ButtonProps = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} {variant} {size} {...buttonProps}>
				<svelte:boundary>
					{#snippet pending()}
						💸 <Skeleton class="h-3.75 w-7" />
					{/snippet}
					💸 {await getMonthlyCredits()}
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
					<svelte:boundary>
						{#snippet pending()}
							<Skeleton class="h-3.75 w-7" />
						{/snippet}
						<span class="text-sm font-medium text-gray-500">{await getMonthlyCredits()}</span>
					</svelte:boundary>
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
