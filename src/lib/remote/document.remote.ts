import { command, getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import * as db from '$server/db/queries';
import { error } from '@sveltejs/kit';
import type { ArtifactKind } from '$components/artifact.svelte';

export const getDocumentsById = query(z.string(), async (id: string) => {
	const {
		locals: { session }
	} = getRequestEvent();

	if (!id) {
		error(400, 'Parameter id is missing');
	}

	if (!session?.userId) {
		error(401, 'Unauthorized');
	}

	const documents = await db.getDocumentsById({ id });

	const [document] = documents;

	if (!document) {
		error(404, 'Not found');
	}

	if (document.userId !== session.userId) {
		error(403, 'Forbidden');
	}

	return documents;
});

export const saveDocument = command(
	z.object({
		id: z.string(),
		content: z.string(),
		title: z.string(),
		kind: z.string() as z.ZodType<ArtifactKind>
	}),
	async ({ id, content, title, kind }) => {
		const {
			locals: { session }
		} = getRequestEvent();

		if (!id) {
			error(400, 'Parameter id is required.');
		}

		if (!session?.userId) {
			error(401, 'Unauthorized');
		}

		const documents = await db.getDocumentsById({ id });

		if (documents.length > 0) {
			const [document] = documents;

			if (document.userId !== session.userId) {
				error(403, 'Forbidden');
			}
		}

		const document = await db.saveDocument({
			id,
			content,
			title,
			kind,
			userId: session.userId
		});

		return document;
	}
);

export const deleteDocumentsByIdAfterTimestamp = command(
	z.object({
		id: z.string(),
		timestamp: z.string()
	}),
	async ({ id, timestamp }) => {
		const {
			locals: { session }
		} = getRequestEvent();

		if (!id) {
			error(400, 'Parameter id is required.');
		}

		if (!timestamp) {
			error(400, 'Parameter timestamp is required.');
		}

		if (!session?.userId) {
			error(401, 'Unauthorized');
		}

		const documents = await db.getDocumentsById({ id });

		const [document] = documents;

		if (document.userId !== session.userId) {
			error(403, 'Forbidden');
		}

		const documentsDeleted = await db.deleteDocumentsByIdAfterTimestamp({
			id,
			timestamp: new Date(timestamp)
		});

		return documentsDeleted;
	}
);
