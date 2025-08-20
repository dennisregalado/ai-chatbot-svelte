<script lang="ts">
	import type { User } from 'better-auth';
	import { cn } from '$lib/utils';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$components/ui/dropdown-menu';
	import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '$components/ui/sidebar';
	import { getTheme } from '@sejohnson/svelte-themes';
	import { signOut, getUser } from '$remote/auth.remote';
	import { Skeleton } from '$components/ui/skeleton';
	import { LoaderIcon } from './icons.svelte';

	const theme = getTheme();
</script>

<SidebarMenu>
	<SidebarMenuItem>
		<DropdownMenu>
			<DropdownMenuTrigger>
				{#snippet child({ props })}
					<svelte:boundary>
						{#snippet pending()}
							<SidebarMenuButton
								class="h-10 justify-between bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div class="flex flex-row items-center gap-2">
									<Skeleton class="size-6 rounded-full" />
									<Skeleton class="h-4 w-24" />
								</div>

								<div class="animate-spin text-zinc-500">
									{@render LoaderIcon()}
								</div>
							</SidebarMenuButton>
						{/snippet}
						<SidebarMenuButton
							{...props}
							class="h-10 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							{#await getUser() then data}
								{#if data}
									{@render user(data as User & { isAnonymous: boolean })}
								{:else}
									<div class="flex flex-row items-center gap-2">
										<Skeleton class="size-6 rounded-full" />
										<Skeleton class="h-4 w-24" />
									</div>
								{/if}
							{/await}
						</SidebarMenuButton>
					</svelte:boundary>
				{/snippet}
			</DropdownMenuTrigger>
			<DropdownMenuContent side="top" class="w-[--bits-floating-anchor-width]">
				<DropdownMenuItem
					class="cursor-pointer"
					onSelect={() =>
						(theme.selectedTheme = theme.resolvedTheme === 'light' ? 'dark' : 'light')}
				>
					Toggle {theme.resolvedTheme === 'light' ? 'dark' : 'light'} mode
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					{#snippet child({ props })}
						<svelte:boundary>
							{#snippet pending()}{/snippet}
							{#await getUser() then user}
								{#if user?.isAnonymous}
									<a
										{...props}
										href="/login"
										class={cn('w-full cursor-pointer', props.class as string)}
										>Login to your account
									</a>
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
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	</SidebarMenuItem>
</SidebarMenu>

{#snippet user(user: (User & { isAnonymous: boolean }) | undefined)}
	<img
		src="https://avatar.vercel.sh/{user?.id}"
		alt="User Avatar"
		width={24}
		height={24}
		class="rounded-full"
	/>
	<span class="truncate">
		{#if user?.isAnonymous}
			Guest
		{:else}
			{user?.email}
		{/if}
	</span>
	<ChevronUp class="ml-auto" />
{/snippet}
