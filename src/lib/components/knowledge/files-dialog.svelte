<script lang="ts">
	import * as Dialog from '$components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import UploadIcon from '@lucide/svelte/icons/upload';
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" size="sm" {...props}>
				<UploadIcon />
				Add Files
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Files</Dialog.Title>
			<Dialog.Description>
				Upload files to add them to your knowledge base. Supported formats include PDF, DOCX, TXT,
				and more.
			</Dialog.Description>
		</Dialog.Header>
		<div class="py-4">
			<!-- File upload form will go here -->
			<p class="text-sm text-muted-foreground">File upload form coming soon...</p>
		</div>
	</Dialog.Content>
</Dialog.Root>
