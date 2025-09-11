<script lang="ts">
	import { getMonthlyCredits } from '$remote/customer.remote';
	import { Button, type ButtonProps } from '$components/ui/button';
	import { Skeleton } from '$components/ui/skeleton';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import Upgrade from '$components/upgrade.svelte';
	import { IsMobile } from '$hooks/is-mobile.svelte.ts';

	let { variant = 'outline', size = 'sm', ...buttonProps }: ButtonProps = $props();

	let open = $state(false);
	let isMobile = new IsMobile();
</script>

{#if !isMobile.current}
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
				<Upgrade class="w-full" size="sm" title="Upgrade your plan to buy more credits"
					>Buy Credits</Upgrade
				>
			</div>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<Drawer.Root bind:open>
		<Button
			{variant}
			{size}
			{...buttonProps}
			onclick={() => {
				open = true;
			}}
		>
			<svelte:boundary>
				{#snippet pending()}
					💸 <Skeleton class="h-3.75 w-7" />
				{/snippet}
				💸 {await getMonthlyCredits()}
			</svelte:boundary>
		</Button>
		<Drawer.Content>
			<Drawer.Header>
				<Drawer.Title class="text-xl font-semibold">Credit Balance</Drawer.Title>
				<p class="text-sm text-muted-foreground">
					View your current credit usage and upgrade options.
				</p>
			</Drawer.Header>
			<div class="space-y-4 max-md:px-2.5 max-md:pb-4">
				<div class="space-y-3">
					<div class="flex w-full items-center justify-between gap-4">
						<span class="text-sm font-normal">Monthly credits</span>
						<svelte:boundary>
							{#snippet pending()}
								<Skeleton class="h-3.75 w-7" />
							{/snippet}
							<span class="text-sm font-medium text-gray-500">{await getMonthlyCredits()}</span>
						</svelte:boundary>
					</div>
					<div class="flex w-full items-center justify-between gap-4">
						<span class="text-sm font-normal">Purchased credits</span>
						<span class="text-sm font-medium text-gray-500">0.00</span>
					</div>
				</div>
				<div class="space-y-2">
					<Upgrade size="sm" class="w-full" title="Upgrade your plan to buy more credits"
						>Buy Credits</Upgrade
					>
				</div>
			</div>
		</Drawer.Content>
	</Drawer.Root>
{/if}
