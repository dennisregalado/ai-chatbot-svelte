<script lang="ts" module>
	// export type ArtifactKind = (typeof artifactDefinitions)[number]['kind'];

	export interface UIArtifact {
		title: string;
		documentId: string;
		//	kind: ArtifactKind;
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

	// export type ArtifactKind = (typeof artifactDefinitions)[number]['kind'];

	export type ArtifactKind = 'text' | 'code' | 'image' | 'sheet';

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
