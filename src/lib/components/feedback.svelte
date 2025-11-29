<script lang="ts">
	import * as Dialog from '$components/ui/dialog';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button, type ButtonProps, buttonVariants } from '$components/ui/button';
	import { Textarea } from '$components/ui/textarea';
	import { cn } from '$lib/utils';
	import { submitFeedback } from '$remote/customer.remote';
	import { toast } from 'svelte-sonner';
	import { IsMobile } from '$hooks/is-mobile.svelte';
	import * as Field from '$lib/components/ui/field';

	let { children, ...buttonProps }: ButtonProps = $props();

	let title = 'Give feedback';
	let description =
		"We'd love to hear what went well or how we can improve the product experience.";

	let open = $state(false);

	const sentiments = [
		{ value: 'sad', emoji: '😞' },
		{ value: 'neutral', emoji: '😐' },
		{ value: 'happy', emoji: '😊' }
	] as const;

	let isMobile = new IsMobile();
</script>

{#if !isMobile.current}
	<Dialog.Root bind:open>
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button {...props} {...buttonProps}>
					{@render children?.()}
				</Button>
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-md" showCloseButton={false}>
			<Dialog.Header>
				<Dialog.Title class="text-xl font-semibold">{title}</Dialog.Title>
				<Field.Description>
					{description}
				</Field.Description>
			</Dialog.Header>
			{@render feedbackForm()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open>
		<Button
			{...buttonProps}
			onclick={() => {
				open = true;
			}}
		>
			{@render children?.()}
		</Button>
		<Drawer.Content>
			<Drawer.Header>
				<Drawer.Title class="text-xl font-semibold">{title}</Drawer.Title>
				<Field.Description class="text-sm">
					{description}
				</Field.Description>
			</Drawer.Header>
			{@render feedbackForm()}
		</Drawer.Content>
	</Drawer.Root>
{/if}

{#snippet feedbackForm()}
	<form
		class="space-y-4 max-md:px-2.5 max-md:pb-4"
		{...submitFeedback}
		oninput={() => submitFeedback.validate()}
	>
		<Field.Group>
			<Field.Set>
				<Field.Group>
					<Field.Field>
						<Textarea
							class="min-h-24 resize-none"
							placeholder="Your feedback helps us improve..."
							rows={6}
							{...submitFeedback.fields.message.as('text')}
						/>
						{#each submitFeedback.fields.message.issues() as issue}
							<Field.Error>{issue.message}</Field.Error>
						{/each}
					</Field.Field>
				</Field.Group>
			</Field.Set>
			<Field.Set>
				<Field.Group>
					<Field.Field orientation="horizontal" class="justify-between">
						<Field.Field
							class="flex w-max gap-2"
							orientation="horizontal"
							aria-invalid={submitFeedback.fields.sentiment.issues()?.length ? true : false}
						>
							{#each sentiments as sentiment}
								<Field.Label
									class={cn(
										buttonVariants({ variant: 'outline', size: 'sm' }),
										'relative cursor-pointer [&:has(>input:checked)]:bg-accent'
									)}
								>
									<input
										class="sr-only"
										{...submitFeedback.fields.sentiment.as('radio', sentiment.value)}
									/>
									<span class="text-lg">{sentiment.emoji}</span>
								</Field.Label>
							{/each}
						</Field.Field>
						<Field.Field class="flex w-max gap-2" orientation="horizontal">
							<Button type="submit" size="sm" disabled={submitFeedback.pending > 0}>Submit</Button>
							<Button variant="outline" type="button" size="sm" onclick={() => (open = false)}
								>Cancel</Button
							>
						</Field.Field>
					</Field.Field>
				</Field.Group>
			</Field.Set>
		</Field.Group>
	</form>
{/snippet}
