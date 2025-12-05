<script lang="ts">
	import * as Dialog from '$components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import TypeIcon from '@lucide/svelte/icons/type';
	import * as Field from '$lib/components/ui/field/index.js';
	import { createText } from '$lib/remote/knowledge.remote';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import InfoIcon from '@lucide/svelte/icons/info';
	import { Spinner } from '$lib/components/ui/spinner';
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" size="sm" {...props}>
				<TypeIcon />
				Create Text
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Create a text document</Dialog.Title>
		</Dialog.Header>
		<form {...createText} class="contents" oninput={() => createText.validate()}>
			<Field.Group>
				<Field.Set>
					<Field.Group>
						<Field.Field>
							<Field.Label for="textName">Text Name</Field.Label>
							<InputGroup.Root>
								<InputGroup.Input
									id="textName"
									placeholder="My Document"
									{...createText.fields.textName.as('text')}
								/>
								<InputGroup.Addon align="inline-end">
									<Tooltip.Root>
										<Tooltip.Trigger>
											{#snippet child({ props })}
												<InputGroup.Button {...props} class="rounded-full" size="icon-xs">
													<InfoIcon />
												</InputGroup.Button>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content>Enter a name for your text document.</Tooltip.Content>
									</Tooltip.Root>
								</InputGroup.Addon>
							</InputGroup.Root>
							{#each createText.fields.textName.issues() as issue}
								<Field.Error>{issue.message}</Field.Error>
							{/each}
						</Field.Field>
					</Field.Group>
					<Field.Group>
						<Field.Field>
							<Field.Label for="textContent">Content</Field.Label>
							<InputGroup.Root>
								<InputGroup.Textarea
									id="textContent"
									placeholder="Enter your text content here..."
									rows={8}
									{...createText.fields.textContent.as('text')}
								/>
							</InputGroup.Root>
							{#each createText.fields.textContent.issues() as issue}
								<Field.Error>{issue.message}</Field.Error>
							{/each}
						</Field.Field>
					</Field.Group>
				</Field.Set>
			</Field.Group>
			<Dialog.Footer>
				<Button disabled={createText.pending > 0} type="submit">
					{#if createText.pending > 0}
						<Spinner />
					{/if}
					Create Text
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
