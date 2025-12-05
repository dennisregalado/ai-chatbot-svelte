<script lang="ts">
	import * as Dialog from '$components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import * as Field from '$lib/components/ui/field/index.js';
	import { addUrl } from '$lib/remote/knowledge.remote';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import InfoIcon from '@lucide/svelte/icons/info';
	import { Spinner } from '$lib/components/ui/spinner';
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" size="sm" {...props}>
				<GlobeIcon />
				Add URL
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add a web page</Dialog.Title>
		</Dialog.Header>
		<form {...addUrl} class="contents" oninput={() => addUrl.validate()}>
			<Field.Group>
				<Field.Set>
					<Field.Group>
						<Field.Field>
							<Field.Label for="url">URL</Field.Label>
							<InputGroup.Root>
								<InputGroup.Input
									id="url"
									placeholder="https://www.apple.com"
									{...addUrl.fields.url.as('url')}
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
										<Tooltip.Content>This is content in a tooltip.</Tooltip.Content>
									</Tooltip.Root>
								</InputGroup.Addon>
							</InputGroup.Root>
							{#each addUrl.fields.url.issues() as issue}
								<Field.Error>{issue.message}</Field.Error>
							{/each}
						</Field.Field>
					</Field.Group>
				</Field.Set>
			</Field.Group>
			<Dialog.Footer>
				<Button disabled={addUrl.pending > 0} type="submit">
					{#if addUrl.pending > 0}
						<Spinner />
					{/if}
					Add URL
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
