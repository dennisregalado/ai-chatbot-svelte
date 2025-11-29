<script lang="ts">
    import { getUser } from '$remote/auth.remote';
    import WorkspaceSwitcher from './workspace-switcher.svelte';
    import Upgrade from './upgrade.svelte';
    import Feedback from './feedback.svelte';
    import SidebarUserNav from './sidebar-user-nav.svelte';
    import { buttonVariants } from './ui/button/button.svelte';
    import SettingsDialog from './settings-dialog.svelte';
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

    type ListItemProps = HTMLAttributes<HTMLAnchorElement> & {
        title: string;
        href: string;
        content: string;
    };

    let user = $derived(await getUser());
</script>

<header
		class="@container/chat-header relative z-20 flex h-12.5 w-full shrink-0 items-center justify-between gap-4 px-3 sm:px-2"
	>
    {#if user}
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
                            class="from-muted/50 to-muted bg-linear-to-b outline-hidden flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline focus:shadow-md"
                        >
                            {#snippet child({ props })}
                                <a {...props} href="/">
                                    <div class="mb-2 mt-4 text-lg font-medium">shadcn/ui</div>
                                    <p class="text-muted-foreground text-sm leading-tight">
                                        Beautifully designed components built with Tailwind CSS.
                                    </p>
                                </a>
                            {/snippet}
                        </NavigationMenu.Link>
                    </li>
                    {@render ListItem({ href: '/docs', title: 'Introduction', content: 'Re-usable components built using Radix UI and Tailwind CSS.' })}
                    {@render ListItem({ href: '/docs/installation', title: 'Installation', content: 'How to install dependencies and structure your app.' })}
                    {@render ListItem({ href: '/docs/primitives/typography', title: 'Typography', content: 'Styles for headings, paragraphs, lists...etc' })}
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
                    <a href="/#customers" class={buttonVariants({ variant: 'ghost', size: 'sm' })}>Customers</a>
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

{#snippet ListItem({
    title,
    content,
    href,
    class: className,
    ...restProps
}: ListItemProps)}
<li>
    <NavigationMenu.Link>
        {#snippet child()}
            <a
                {href}
                class={cn(
                    "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                    className
                )}
                {...restProps}
            >
                <div class="text-sm font-medium leading-none">{title}</div>
                <p class="text-muted-foreground line-clamp-2 text-sm leading-snug">
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
<div class="flex flex-1 items-center justify-end gap-1.5"> 
        <Upgrade variant="outline" size="sm">Upgrade</Upgrade>
        <Feedback variant="outline" size="sm">Feedback</Feedback>
        <SidebarUserNav />  
</div>
{/snippet}