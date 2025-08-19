<script lang="ts">
	import { cn } from '$lib/utils';
	import SparklesIcon from '../icons/sparkles.svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
	import { Button } from '../ui/button';
	import PencilEditIcon from '../icons/pencil-edit.svelte';
	import PreviewAttachment from '../preview-attachment.svelte';
	import { Markdown } from '../markdown';
	import MessageReasoning from '../message-reasoning.svelte';
	import { fly } from 'svelte/transition';
	import type { UIMessage } from '@ai-sdk/svelte';

	let {
		message,
		readonly,
		loading,
		requiresScrollPadding
	}: { message: UIMessage; readonly: boolean; loading: boolean; requiresScrollPadding: boolean } =
		$props();

	let mode = $state<'view' | 'edit'>('view');

	let attachmentsFromMessage = $derived(message.parts.filter((part) => part.type === 'file'));
</script>

<div
	class="group/message mx-auto w-full max-w-3xl px-4"
	data-role={message.role}
	in:fly|global={{ opacity: 0, y: 5 }}
>
	<div
		class={cn(
			'flex w-full gap-4 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
			{
				'w-full': mode === 'edit',
				'group-data-[role=user]/message:w-fit': mode !== 'edit'
			}
		)}
	>
		{#if message.role === 'assistant'}
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border"
			>
				<div class="translate-y-px">
					<SparklesIcon size={14} />
				</div>
			</div>
		{/if}

		<div
			class={cn('flex w-full flex-col gap-4', {
				'min-h-96': message.role === 'assistant' && requiresScrollPadding
			})}
		>
			{#if attachmentsFromMessage.length > 0}
				<div class="flex flex-row justify-end gap-2">
					{#each attachmentsFromMessage as attachment (attachment.url)}
						<PreviewAttachment
							attachment={{
								name: attachment.filename ?? 'file',
								contentType: attachment.mediaType,
								url: attachment.url
							}}
						/>
					{/each}
				</div>
			{/if}

			{#each message.parts as part, index (`${message.id}-${index}`)}
				{@const key = `message-${message.id}-part-${index}`}
				{@const { type } = part}
				{#if type === 'reasoning' && part.text?.trim().length > 0}
					{#key key}
						<MessageReasoning {loading} reasoning={part.text} />
					{/key}
				{/if}
				{#if type === 'text'}
					{#if mode === 'view'}
						<div class="flex flex-row items-start gap-2">
							{#if message.role === 'user' && !readonly}
								<Tooltip>
									<TooltipTrigger>
										{#snippet child({ props })}
											<Button
												{...props}
												variant="ghost"
												class="h-fit rounded-full px-2 text-muted-foreground opacity-0 group-hover/message:opacity-100"
												onclick={() => {
													mode = 'edit';
												}}
											>
												<PencilEditIcon />
											</Button>
										{/snippet}
									</TooltipTrigger>
									<TooltipContent>Edit message</TooltipContent>
								</Tooltip>
							{/if}
							<div
								class={cn('flex flex-col gap-4', {
									'rounded-xl bg-primary px-3 py-2 text-primary-foreground': message.role === 'user'
								})}
							>
								<Markdown md={part.text} />
							</div>
						</div>
					{:else if mode === 'edit'}
						<div class="flex flex-row items-start gap-2">
							<div class="size-8"></div>

							<!-- TODO -->
							{#key message.id}
								<!-- <MessageEditor key={message.id} {message} {setMode} {setMessages} {reload} /> -->
							{/key}
						</div>
					{/if}
				{/if}
			{/each}

			{#if !readonly}
				<!-- TODO -->
				{#key `action-${message.id}`}
					<!-- <MessageActions key={`action-${message.id}`} {chatId} {message} {vote} {isLoading} /> -->
				{/key}
			{/if}
		</div>
	</div>
</div>
