import { Artifact } from '$components/create-artifact.svelte';
import type { Suggestion } from '$server/db/schema';
import {
	ClockRewind,
	MessageIcon,
	PenIcon,
	UndoIcon,
	RedoIcon,
	CopyIcon
} from '$components/icons.svelte';
import { toast } from 'svelte-sonner';

interface TextArtifactMetadata {
	suggestions: Array<Suggestion>;
}

export const textArtifact = new Artifact<'text', TextArtifactMetadata>({
	kind: 'text',
	description: 'Useful for text content, like drafting essays and emails.',
	initialize: async ({ documentId, setMetadata }) => {},
	onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {},
	content: ({
		mode,
		status,
		content,
		isCurrentVersion,
		currentVersionIndex,
		onSaveContent,
		getDocumentContentById,
		isLoading,
		metadata
	}) => {},
	actions: [
		{
			icon: ClockRewind,
			description: 'View changes',
			onClick: ({ handleVersionChange }) => {
				handleVersionChange('toggle');
			},
			isDisabled: ({ currentVersionIndex, setMetadata }) => {
				if (currentVersionIndex === 0) {
					return true;
				}

				return false;
			}
		},
		{
			icon: UndoIcon,
			description: 'View Previous version',
			onClick: ({ handleVersionChange }) => {
				handleVersionChange('prev');
			},
			isDisabled: ({ currentVersionIndex }) => {
				if (currentVersionIndex === 0) {
					return true;
				}

				return false;
			}
		},
		{
			icon: RedoIcon,
			description: 'View Next version',
			onClick: ({ handleVersionChange }) => {
				handleVersionChange('next');
			},
			isDisabled: ({ isCurrentVersion }) => {
				if (isCurrentVersion) {
					return true;
				}

				return false;
			}
		},
		{
			icon: CopyIcon,
			description: 'Copy to clipboard',
			onClick: ({ content }) => {
				navigator.clipboard.writeText(content);
				toast.success('Copied to clipboard!');
			}
		}
	],
	toolbar: [
		{
			icon: PenIcon,
			description: 'Add final polish',
			onClick: ({ sendMessage }) => {
				sendMessage({
					role: 'user',
					parts: [
						{
							type: 'text',
							text: 'Please add final polish and check for grammar, add section titles for better structure, and ensure everything reads smoothly.'
						}
					]
				});
			}
		},
		{
			icon: MessageIcon,
			description: 'Request suggestions',
			onClick: ({ sendMessage }) => {
				sendMessage({
					role: 'user',
					parts: [
						{
							type: 'text',
							text: 'Please add suggestions you have that could improve the writing.'
						}
					]
				});
			}
		}
	]
});
