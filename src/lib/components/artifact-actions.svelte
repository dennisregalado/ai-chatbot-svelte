<script lang="ts" module>
	import { artifactDefinitions } from '$server/artifacts';
	import type { UIArtifact } from './artifact.svelte';
	import type { ArtifactActionContext } from './create-artifact.svelte';
	import { toast } from 'svelte-sonner';
	import Button from './ui/button/button.svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

	interface ArtifactActionsProps {
		artifact: UIArtifact;
		handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
		currentVersionIndex: number;
		isCurrentVersion: boolean;
		mode: 'edit' | 'diff';
		metadata: Record<string, unknown>;
		setMetadata: (value: Record<string, unknown>) => void;
	}
</script>

<script lang="ts">
	let {
		artifact,
		handleVersionChange,
		currentVersionIndex,
		isCurrentVersion,
		mode,
		metadata,
		setMetadata
	}: ArtifactActionsProps = $props();

	let isLoading = $state(false);

	const artifactDefinition = artifactDefinitions.find(
		(definition) => definition.kind === artifact.kind
	);

	if (!artifactDefinition) {
		throw new Error('Artifact definition not found!');
	}

	const actionContext: ArtifactActionContext = {
		content: artifact.content,
		handleVersionChange,
		currentVersionIndex,
		isCurrentVersion,
		mode,
		metadata,
		setMetadata
	};

	async function handleActionClick(action: typeof safeArtifactDefinition.actions[0]) {
		isLoading = true;

		try {
			await Promise.resolve(action.onClick(actionContext));
		} catch (_error) {
			toast.error('Failed to execute action');
		} finally {
			isLoading = false;
		}
	}

	function isActionDisabled(action: typeof safeArtifactDefinition.actions[0]): boolean {
		if (isLoading || artifact.status === 'streaming') {
			return true;
		}

		if (action.isDisabled) {
			return action.isDisabled(actionContext);
		}

		return false;
	}

	// Type-safe reference after null check
	const safeArtifactDefinition = artifactDefinition;
</script>

<div class="flex flex-row gap-1">
	{#each safeArtifactDefinition.actions as action (action.description)}
		<Tooltip>
			<TooltipTrigger>
				<Button
					variant="outline"
					class="h-fit dark:hover:bg-zinc-700 {action.label ? 'py-1.5 px-2' : 'p-2'}"
					onclick={() => handleActionClick(action)}
					disabled={isActionDisabled(action)}
				>
					{@render action.icon()}
					{#if action.label}
						{action.label}
					{/if}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				{action.description}
			</TooltipContent>
		</Tooltip>
	{/each}
</div>
