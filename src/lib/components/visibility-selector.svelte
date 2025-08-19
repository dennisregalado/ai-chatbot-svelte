<script module lang="ts">
	import LockIcon from './icons/lock.svelte';
	import GlobeIcon from './icons/globe.svelte';

	export type VisibilityType = 'private' | 'public';

	export const visibilities: Array<{
		id: VisibilityType;
		label: string;
		description: string;
		icon: any;
	}> = [
		{
			id: 'private',
			label: 'Private',
			description: 'Only you can access this chat',
			icon: LockIcon
		},
		{
			id: 'public',
			label: 'Public',
			description: 'Anyone with the link can access this chat',
			icon: GlobeIcon
		}
	];
</script>

<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button } from './ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from './ui/dropdown-menu';
	import ChevronDownIcon from './icons/chevron-down.svelte';
	import CheckCircleFillIcon from './icons/check-circle-fill.svelte';
	import { updateChatVisibility, getChatHistory, getChatVisibility } from '$remote/chat.remote';
	import type { ClassValue } from 'svelte/elements';
	import { toast } from 'svelte-sonner';

	let { chatId, class: c }: { chatId: string; class?: ClassValue } = $props();

	let open = $state(false);

	let chatVisibility = getChatVisibility(chatId);

	let selectedVisibility = $derived(
		visibilities.find((visibility) => visibility.id === chatVisibility.current)
	);
</script>

<DropdownMenu {open} onOpenChange={(val) => (open = val)}>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				class={cn(
					'hidden w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground md:flex md:h-[34px] md:px-2',
					c
				)}
			>
				{#if selectedVisibility?.id === 'public'}
					<GlobeIcon />
				{:else}
					<LockIcon />
				{/if}
				{selectedVisibility?.label}
				<ChevronDownIcon />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent align="start" class="min-w-[300px]">
		{#each visibilities as visibility (visibility.id)}
			<DropdownMenuItem
				onSelect={async () => {
					try {
						await updateChatVisibility({
							chatId,
							visibility: visibility.id
						}).updates(
							getChatHistory().withOverride((chats) =>
								chats.map((c) => (c.id === chatId ? { ...c, visibility: visibility.id } : c))
							),
							getChatVisibility(chatId).withOverride((v) => visibility.id)
						);
					} catch (error) {
						toast.error('Failed to update chat visibility');
					} finally {
						open = false;
					}
				}}
				class="group/item flex flex-row items-center justify-between gap-4"
				data-active={visibility.id === selectedVisibility?.id}
			>
				<div class="flex flex-col items-start gap-1">
					{visibility.label}
					<div class="text-xs text-muted-foreground">
						{visibility.description}
					</div>
				</div>
				<div
					class="text-foreground opacity-0 group-data-[active=true]/item:opacity-100 dark:text-foreground"
				>
					<CheckCircleFillIcon />
				</div>
			</DropdownMenuItem>
		{/each}
	</DropdownMenuContent>
</DropdownMenu>
