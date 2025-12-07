<script lang="ts">
	import { getUser, signOut } from '$remote/auth.remote';
	import WorkspaceSwitcher from './workspace-switcher.svelte';
	import { buttonVariants } from './ui/button/button.svelte';
	import SettingsDialog from './settings-dialog.svelte';
	import * as Field from '$lib/components/ui/field';
	import type { User } from '$lib/auth';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$components/ui/button';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { IsMobile } from '$hooks/is-mobile.svelte';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import CircleHelpIcon from '@lucide/svelte/icons/circle-help';
	import CircleIcon from '@lucide/svelte/icons/circle';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import { page } from '$app/state';
	import BrowserTabs from './browser-tabs.svelte';
	import * as UnderlineTabs from '$lib/components/ui/underline-tabs';
	type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
		title: string;
		href: string;
		content: string;
	};

	let user = $derived(await getUser());
	let isOnboarding = $derived(page.route?.id?.includes('welcome'));
</script>

<header
	class="@container/chat-header relative z-20 flex h-12.5 w-full shrink-0 items-center justify-between gap-4 px-3 sm:px-2"
>
	{#if user && isOnboarding}
		{@render welcomeHeader({ user })}
	{:else if user}
		{@render privateHeader({ user })}
	{:else}
		{@render publicHeader()}
	{/if}
</header>

{#snippet publicHeader()}
	<div class="flex min-w-0 flex-1 items-center"></div>
	{@render navigationMenu()}
	<div class="flex flex-1 items-center justify-end gap-1.5">
		<a href="/signin" class={buttonVariants({ variant: 'outline', size: 'sm' })}>Sign In</a>
		<a href="/signup" class={buttonVariants({ size: 'sm' })}>Sign Up</a>
	</div>
{/snippet}

{#snippet navigationMenu()}
	{@const isMobile = new IsMobile()}
	<NavigationMenu.Root viewport={isMobile.current}>
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
					Product
				</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<ul class="grid gap-2 p-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
						<li class="row-span-3">
							<NavigationMenu.Link
								class="flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-hidden select-none focus:shadow-md"
							>
								{#snippet child({ props })}
									<a {...props} href="/">
										<div class="mt-4 mb-2 text-lg font-medium">shadcn/ui</div>
										<p class="text-sm leading-tight text-muted-foreground">
											Beautifully designed components built with Tailwind CSS.
										</p>
									</a>
								{/snippet}
							</NavigationMenu.Link>
						</li>
						{@render ListItem({
							href: '/docs',
							title: 'Introduction',
							content: 'Re-usable components built using Radix UI and Tailwind CSS.'
						})}
						{@render ListItem({
							href: '/docs/installation',
							title: 'Installation',
							content: 'How to install dependencies and structure your app.'
						})}
						{@render ListItem({
							href: '/docs/primitives/typography',
							title: 'Typography',
							content: 'Styles for headings, paragraphs, lists...etc'
						})}
					</ul>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item class="hidden md:block">
				<NavigationMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
					Solutions
				</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<ul class="grid w-[200px] gap-4 p-2">
						<li>
							<NavigationMenu.Link href="#" class="flex items-center gap-2">
								<CircleHelpIcon />
								Backlog
							</NavigationMenu.Link>
							<NavigationMenu.Link href="#" class="flex items-center gap-2">
								<CircleIcon />
								To Do
							</NavigationMenu.Link>
							<NavigationMenu.Link href="#" class="flex items-center gap-2">
								<CircleCheckIcon />
								Done
							</NavigationMenu.Link>
						</li>
					</ul>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Link>
					{#snippet child()}
						<a href="/#customers" class={buttonVariants({ variant: 'ghost', size: 'sm' })}
							>Customers</a
						>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Link>
					{#snippet child()}
						<a href="/#pricing" class={buttonVariants({ variant: 'ghost', size: 'sm' })}>Pricing</a>
					{/snippet}
				</NavigationMenu.Link>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
{/snippet}

{#snippet ListItem({ title, content, href, class: className, ...restProps }: ListItemProps)}
	<li>
		<NavigationMenu.Link>
			{#snippet child()}
				<a
					{href}
					class={cn(
						'block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
						className
					)}
					{...restProps}
				>
					<div class="text-sm leading-none font-medium">{title}</div>
					<p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{content}
					</p>
				</a>
			{/snippet}
		</NavigationMenu.Link>
	</li>
{/snippet}

{#snippet privateHeader({ user }: { user: User })}
	<div class="flex min-w-0 flex-1 items-center">
		<WorkspaceSwitcher />
	</div>
	<div class="flex flex-1 items-center justify-end">
		<div class="relative w-full pl-10">
			<BrowserTabs />
		</div>
	</div>
	<div class="flex flex-1 items-center justify-end gap-1.5">
		<!-- <Upgrade variant="outline" size="sm">Upgrade</Upgrade>
		<Feedback variant="outline" size="sm">Feedback</Feedback> -->
		<SettingsDialog>
			{#snippet children({ ...props })}
				<Button {...props}>
					<Avatar.Root class="size-6">
						<Avatar.Image
							src={user?.image || `https://avatar.vercel.sh/${user?.id}`}
							alt={user?.name}
						/>
					</Avatar.Root>
				</Button>
			{/snippet}
		</SettingsDialog>
	</div>
{/snippet}

{#snippet welcomeHeader({ user }: { user: User })}
	<div class="flex min-w-0 flex-1 items-center"></div>
	<div class="flex flex-1 items-center justify-end gap-2.5">
		<UnderlineTabs.Root>
			<UnderlineTabs.List>
				<form {...signOut} class="contents">
					<UnderlineTabs.Trigger value={'/welcome/1'}
						>Not {user.name}? Sign Out</UnderlineTabs.Trigger
					>
				</form>
				<UnderlineTabs.Trigger class="px-2" value={'/welcome/2'}>
					<Avatar.Root class="size-6">
						<Avatar.Image
							src={user?.image || `https://avatar.vercel.sh/${user?.id}`}
							alt={user?.name}
						/>
					</Avatar.Root>
				</UnderlineTabs.Trigger>
			</UnderlineTabs.List>
		</UnderlineTabs.Root>
	</div>
{/snippet}
