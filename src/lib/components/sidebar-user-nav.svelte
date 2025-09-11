<script lang="ts">
	import type { User } from '$lib/auth';
	import { cn } from '$lib/utils';
	import { getTheme } from '@sejohnson/svelte-themes';
	import { signOut, getUser } from '$remote/auth.remote';
	import { Skeleton } from '$components/ui/skeleton';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$components/ui/button';
	import Upgrade from '$components/upgrade.svelte';
	import { getMonthlyCredits } from '$remote/customer.remote';
	const theme = getTheme();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="icon" class="h-max w-max rounded-full">
				<svelte:boundary>
					{#snippet pending()}
						<Skeleton class="size-6 rounded-full" />
					{/snippet}
					{@render user(await getUser())}
				</svelte:boundary>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="end" side="bottom" sideOffset={8} alignOffset={-16}>
		<DropdownMenu.Label class="flex flex-col">
			<svelte:boundary>
				{#snippet pending()}{/snippet}
				{#await getUser() then user}
					{#if user?.isAnonymous}
						<span class="text-sm font-medium">Guest</span>
					{:else}
						<span class="text-sm font-medium">{user?.name}</span>
						<span class="text-xs font-medium text-gray-500">{user?.email}</span>
					{/if}
				{/await}
			</svelte:boundary>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item>Profile</DropdownMenu.Item>
			<DropdownMenu.Item>Settings</DropdownMenu.Item>
			<DropdownMenu.Item>
				Pricing
				<DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Label class="text-xs font-medium text-gray-500">
				Credit Balance
			</DropdownMenu.Label>
			<DropdownMenu.Item>
				<div class="flex w-full items-center justify-between gap-4">
					<span class="text-sm font-normal text-nowrap">Monthly credits</span>
					<svelte:boundary>
						{#snippet pending()}{/snippet}
						<span class="text-sm font-medium text-gray-500">{await getMonthlyCredits()}</span>
					</svelte:boundary>
				</div>
			</DropdownMenu.Item>
			<div class="mt-1 rounded-lg bg-blue-100 p-2">
				<p
					class="font-sm [&amp;_button]:font-medium [&amp;_button]:underline [&amp;_button]:font-medium [&amp;_button]:underline [&amp;_button]:text-blue-800 hover:[&amp;_button]:text-blue-700 text-sm text-blue-900"
				>
					Upgrade your plan to buy more credits. <Upgrade
						class="text-blue-800"
						variant="link"
						size="none">Upgrade plan</Upgrade
					>
				</p>
			</div>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Label class="text-xs font-medium text-gray-500">Preferences</DropdownMenu.Label>
			<DropdownMenu.Item
				class="cursor-pointer"
				onSelect={() => (theme.selectedTheme = theme.resolvedTheme === 'light' ? 'dark' : 'light')}
				>Toggle {theme.resolvedTheme === 'light' ? 'dark' : 'light'} mode</DropdownMenu.Item
			>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>
			{#snippet child({ props })}
				<svelte:boundary>
					{#snippet pending()}{/snippet}
					{#await getUser() then user}
						{#if user?.isAnonymous}
							<a {...props} href="/login">Login to your account </a>
						{:else}
							<form {...signOut}>
								<button
									{...props}
									type="submit"
									class={cn('w-full cursor-pointer', props.class as string)}
								>
									Sign out
								</button>
							</form>
						{/if}
					{/await}
				</svelte:boundary>
			{/snippet}
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

{#snippet user(user?: User)}
	<Avatar.Root class="size-6">
		<Avatar.Image src={user?.image || `https://avatar.vercel.sh/${user?.id}`} alt={user?.name} />
		<Avatar.Fallback>CN</Avatar.Fallback>
	</Avatar.Root>
{/snippet}
