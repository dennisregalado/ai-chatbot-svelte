<script lang="ts">
	import * as Dialog from '$components/ui/dialog/index.js';
	import { Button, type ButtonProps } from '$components/ui/button';
	import { Textarea } from '$components/ui/textarea';

	let { children, ...buttonProps }: ButtonProps = $props();

	let feedbackText = $state('');
	let selectedEmoji = $state<string | null>(null);
	let open = $state(false);

	function selectEmoji(emoji: string) {
		selectedEmoji = emoji;
	}

	function handleSubmit() {
		// Handle feedback submission here
		console.log('Feedback:', feedbackText, 'Emoji:', selectedEmoji);
		// Reset form
		feedbackText = '';
		selectedEmoji = null;
		open = false;
	}

	function handleCancel() {
		// Reset form
		feedbackText = '';
		selectedEmoji = null;
		open = false;
	}
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

		<div class="space-y-4">
			<p class="text-sm text-muted-foreground">
				We'd love to hear what went well or how we can improve the product experience.
			</p>

			<Textarea
				bind:value={feedbackText}
				placeholder="Your feedback"
				class="min-h-24 resize-none"
			/>

			<div class="flex items-center justify-between">
				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => selectEmoji('sad')}
						class="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-accent {selectedEmoji ===
						'sad'
							? 'bg-accent'
							: ''}"
					>
						😞
					</button>
					<button
						type="button"
						onclick={() => selectEmoji('neutral')}
						class="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-accent {selectedEmoji ===
						'neutral'
							? 'bg-accent'
							: ''}"
					>
						😐
					</button>
					<button
						type="button"
						onclick={() => selectEmoji('happy')}
						class="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-accent {selectedEmoji ===
						'happy'
							? 'bg-accent'
							: ''}"
					>
						😊
					</button>
				</div>

				<div class="flex gap-2">
					<Button variant="outline" size="sm" onclick={handleCancel}>Cancel</Button>
					<Button size="sm" onclick={handleSubmit}>Submit</Button>
				</div>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
