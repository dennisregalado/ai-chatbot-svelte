<!-- completed -->
<script lang="ts">
	import { Button } from './ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from './ui/dropdown-menu';
	import CheckCircleFillIcon from './icons/check-circle-fill.svelte';
	import ChevronDownIcon from './icons/chevron-down.svelte';
	import { cn } from '$lib/utils';
	import { chatModels } from '$ai/models';
	import { getChatModel, saveChatModel } from '$remote/chat.remote';
	import { entitlementsByUserType } from '$ai/entitlements';
	import type { ClassValue } from 'svelte/elements';
	import { page } from '$app/state';

	let {
		class: c
	}: {
		class: ClassValue;
	} = $props();

	let open = $state(false);

	let selectedModelId = $derived(page.data.selectedModelId); 
	let isAnonymous = $derived(page.data.user?.isAnonymous);

	const { availableChatModelIds } = $derived(
		entitlementsByUserType[isAnonymous ? 'guest' : 'regular']
	);

	let serverModelId = getChatModel();

	let optimisticModelId = $derived(serverModelId.current ?? selectedModelId);

	let availableChatModels = $derived(
		chatModels.filter((chatModel) => availableChatModelIds.includes(chatModel.id))
	);

	let selectedChatModel = $derived(
		availableChatModels.find((chatModel) => chatModel.id === optimisticModelId)
	);
</script>

<DropdownMenu {open} onOpenChange={(val) => (open = val)}>
	<DropdownMenuTrigger
		class={cn('w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground', c)}
	>
		{#snippet child({ props })}
			<Button {...props} variant="outline" class="md:h-[34px] md:px-2">
				{selectedChatModel?.name}
				<ChevronDownIcon />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent align="start" class="min-w-[300px]">
		{#each availableChatModels as chatModel (chatModel.id)}
			{@const id = chatModel.id}
			<DropdownMenuItem
				onSelect={async () => {
					open = false;
					saveChatModel(id).updates(getChatModel().withOverride((current) => id));
				}}
				class="group/item flex flex-row items-center justify-between gap-4"
				data-active={id === selectedChatModel?.id}
			>
				<div class="flex flex-col items-start gap-1">
					<div>{chatModel.name}</div>
					<div class="text-xs text-muted-foreground">
						{chatModel.description}
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
