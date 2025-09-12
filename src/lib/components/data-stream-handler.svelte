<script lang="ts">
	import { useDataStream } from '$components/data-stream-provider.svelte';

	const { dataStream } = useDataStream();

	// Set the context
	// const { artifact, setArtifact, setMetadata } = useArtifact();
	let lastProcessedIndex = $state(-1);

	$effect(() => {
		if (!dataStream?.length) return;

		const newDeltas = dataStream.slice(lastProcessedIndex + 1);
		lastProcessedIndex = dataStream.length - 1;

		newDeltas.forEach((delta) => {});
	});
</script>
