<script lang="ts">
	import type { User } from 'better-auth';
	import { cn } from '$lib/utils';
	import ChevronUp from './icons/chevron-up.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from './ui/dropdown-menu';
	import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
	import { getTheme } from '@sejohnson/svelte-themes';

	import { signOut } from '$lib/remote/auth.remote';

	let { user }: { user: User } = $props();
	const theme = getTheme();
</script>

<SidebarMenu>
	<SidebarMenuItem>
		<DropdownMenu>
			<DropdownMenuTrigger>
				{#snippet child({ props })}
					<SidebarMenuButton
						{...props}
						class="h-10 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<img
							src={`https://avatar.vercel.sh/${user.email}`}
							alt={user.email ?? 'User Avatar'}
							width={24}
							height={24}
							class="rounded-full"
						/>
										{#if user?.email?.startsWith('guest-')}
					<span class="truncate">Guest</span>
						{:else}
							<span class="truncate">{user?.email}</span>
						{/if}
						<ChevronUp class="ml-auto" />
					</SidebarMenuButton>
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
										{#if user?.email?.startsWith('guest-')}
					<form {...signOut}>
								<button {...props} type="submit" class={cn('w-full cursor-pointer', props.class as string)}>
									Sign out
								</button>
							</form>
						{:else}
							<a {...props} href="/login" class={cn('w-full cursor-pointer', props.class as string)}
								>Login to your account
							</a>
						{/if}
					{/snippet}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	</SidebarMenuItem>
</SidebarMenu>
