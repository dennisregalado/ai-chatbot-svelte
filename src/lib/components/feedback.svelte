<script lang="ts">
	import * as Dialog from '$components/ui/dialog/index.js';
	import { Button, type ButtonProps, buttonVariants } from '$components/ui/button';
	import { Textarea } from '$components/ui/textarea';
	import { cn } from '$lib/utils'; 
	import { submitFeedback } from '$remote/customer.remote';
	import { toast } from 'svelte-sonner';
	
	let { children, ...buttonProps }: ButtonProps = $props();

	let open = $state(false);

	const sentiments = [
		{ value: 'sad', emoji: '😞' },
		{ value: 'neutral', emoji: '😐' },
		{ value: 'happy', emoji: '😊' }
	] as const;
</script>

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
			<Dialog.Title class="text-left">Give feedback</Dialog.Title>
		</Dialog.Header>
		<form
			class="space-y-4"
			{...submitFeedback.enhance(async ({ form, data, submit }) => {
				try {
					open = false;
					await submit();
					form.reset();
					toast.success('Feedback submitted');
				} catch (error) {
					toast.error('Failed to submit feedback');
				}
			})}
		>
			<p class="text-sm text-muted-foreground">
				We'd love to hear what went well or how we can improve the product experience.
			</p>

			<Textarea name="message" placeholder="Your feedback" class="min-h-24 resize-none" />

			<div class="flex items-center justify-between">
				<div class="flex gap-2">
					{#each sentiments as sentiment}
						<label
							class={cn(
								buttonVariants({ variant: 'outline', size: 'sm' }),
								'relative cursor-pointer [&:has(>input:checked)]:bg-accent'
							)}
						>
							<input type="radio" name="sentiment" value={sentiment.value} class="sr-only" />
							<span class="text-lg">{sentiment.emoji}</span>
						</label>
					{/each}
				</div>
				<div class="flex gap-2">
					<Button variant="outline" size="sm" type="button" onclick={() => (open = false)}
						>Cancel</Button
					>
					<Button disabled={submitFeedback.pending > 0} size="sm" type="submit">Submit</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
