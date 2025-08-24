<script lang="ts">
	import { CrossIcon } from './icons.svelte';
	import { Button } from './ui/button';
	// import { initialArtifactData, useArtifact } from '$hooks/artifact.svelte';

	// TODO: Implement artifact management hook
	// const { setArtifact } = useArtifact();
</script>

<Button
	variant="outline"
	class="h-fit p-2 dark:hover:bg-zinc-700"
	onclick={() => {
		// TODO: Implement artifact state management
		/*
		setArtifact((currentArtifact) =>
			currentArtifact.status === 'streaming'
				? {
						...currentArtifact,
						isVisible: false,
					}
				: { ...initialArtifactData, status: 'idle' },
		);
		*/
		console.log('Close artifact clicked - hook implementation pending');
	}}
>
	{@render CrossIcon(18)}
</Button>
