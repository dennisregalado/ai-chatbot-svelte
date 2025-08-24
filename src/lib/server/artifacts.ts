import { codeDocumentHandler } from '$artifacts/code/server';
import { imageDocumentHandler } from '$artifacts/image/server';
import { sheetDocumentHandler } from '$artifacts/sheet/server';
import { textDocumentHandler } from '$artifacts/text/server';
import type { ArtifactKind } from '$components/artifact.svelte';
import type { Document } from '$server/db/schema';
import { saveDocument } from '$server/db/queries';
import type { Session } from 'better-auth';
import type { UIMessageStreamWriter } from 'ai';
import type { ChatMessage } from '$lib/types';
import { textArtifact } from '$artifacts/text/client.svelte';
import type { Artifact } from '$components/create-artifact.svelte';

export interface SaveDocumentProps {
	id: string;
	title: string;
	kind: ArtifactKind;
	content: string;
	userId: string;
}

export interface CreateDocumentCallbackProps {
	id: string;
	title: string;
	dataStream: UIMessageStreamWriter<ChatMessage>;
	session: Session;
}

export interface UpdateDocumentCallbackProps {
	document: Document;
	description: string;
	dataStream: UIMessageStreamWriter<ChatMessage>;
	session: Session;
}

export interface DocumentHandler<T = ArtifactKind> {
	kind: T;
	onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
	onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
}

export function createDocumentHandler<T extends ArtifactKind>(config: {
	kind: T;
	onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
	onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
	return {
		kind: config.kind,
		onCreateDocument: async (args: CreateDocumentCallbackProps) => {
			const draftContent = await config.onCreateDocument({
				id: args.id,
				title: args.title,
				dataStream: args.dataStream,
				session: args.session
			});

			if (args.session?.userId) {
				await saveDocument({
					id: args.id,
					title: args.title,
					content: draftContent,
					kind: config.kind,
					userId: args.session.userId
				});
			}

			return;
		},
		onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
			const draftContent = await config.onUpdateDocument({
				document: args.document,
				description: args.description,
				dataStream: args.dataStream,
				session: args.session
			});

			if (args.session?.userId) {
				await saveDocument({
					id: args.document.id,
					title: args.document.title,
					content: draftContent,
					kind: config.kind,
					userId: args.session.userId
				});
			}

			return;
		}
	};
}

/*
 * Use this array to define the document handlers for each artifact kind.
 */
export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
	textDocumentHandler,
	codeDocumentHandler,
	imageDocumentHandler,
	sheetDocumentHandler
];

export const artifactKinds = ['text', 'code', 'image', 'sheet'] as const;

/*
 * Use this array to define the artifact definitions for each artifact kind.
 * This contains the client-side artifact configurations with actions, toolbar, etc.
 */
export const artifactDefinitions: Array<Artifact<string, any>> = [
	textArtifact
	// TODO: Add other artifacts when they're implemented
	// codeArtifact,
	// imageArtifact,
	// sheetArtifact
];
