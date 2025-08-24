<script lang="ts" module>
	import type { Artifact } from './create-artifact.svelte';

	export type ArtifactKind = (typeof import('$server/artifacts').artifactDefinitions)[number]['kind'];

	export interface UIArtifact {
		title: string;
		documentId: string;
		kind: ArtifactKind;
		content: string;
		isVisible: boolean;
		status: 'streaming' | 'idle';
		boundingBox: {
			top: number;
			left: number;
			width: number;
			height: number;
		};
	}
</script>
