import { Artifact } from '$components/create-artifact.svelte'; 
import type { Suggestion } from '$server/db/schema'; 

interface TextArtifactMetadata {
    suggestions: Array<Suggestion>;
}

export const textArtifact = new Artifact<'text', TextArtifactMetadata>({
    kind: 'text',
    description: 'Useful for text content, like drafting essays and emails.',
    initialize: async ({ documentId, setMetadata }) => {

    },
    onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {

    },
    content: ({
        mode,
        status,
        content,
        isCurrentVersion,
        currentVersionIndex,
        onSaveContent,
        getDocumentContentById,
        isLoading,
        metadata,
    }) => {

    },
    actions: [],
    toolbar: [],
});
