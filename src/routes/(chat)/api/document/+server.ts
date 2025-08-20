import type { ArtifactKind } from '$components/artifact.svelte';
import {
	deleteDocumentsByIdAfterTimestamp,
	getDocumentsById,
	saveDocument
} from '$server/db/queries';
import { ChatSDKError } from '$lib/errors';
import { json } from '@sveltejs/kit';

export async function GET({ request, locals: { session } }) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');

	if (!id) {
		return new ChatSDKError('bad_request:api', 'Parameter id is missing').toResponse();
	}

	if (!session?.userId) {
		return new ChatSDKError('unauthorized:document').toResponse();
	}

	const documents = await getDocumentsById({ id });

	const [document] = documents;

	if (!document) {
		return new ChatSDKError('not_found:document').toResponse();
	}

	if (document.userId !== session.userId) {
		return new ChatSDKError('forbidden:document').toResponse();
	}

	return json(documents);
}

export async function POST({ request, locals: { session } }) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');

	if (!id) {
		return new ChatSDKError('bad_request:api', 'Parameter id is required.').toResponse();
	}

	if (!session?.userId) {
		return new ChatSDKError('not_found:document').toResponse();
	}

	const { content, title, kind }: { content: string; title: string; kind: ArtifactKind } =
		await request.json();

	const documents = await getDocumentsById({ id });

	if (documents.length > 0) {
		const [document] = documents;

		if (document.userId !== session.userId) {
			return new ChatSDKError('forbidden:document').toResponse();
		}
	}

	const document = await saveDocument({
		id,
		content,
		title,
		kind,
		userId: session.userId
	});

	return json(document);
}

export async function DELETE({ request, locals: { session } }) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');
	const timestamp = searchParams.get('timestamp');

	if (!id) {
		return new ChatSDKError('bad_request:api', 'Parameter id is required.').toResponse();
	}

	if (!timestamp) {
		return new ChatSDKError('bad_request:api', 'Parameter timestamp is required.').toResponse();
	}

	if (!session?.userId) {
		return new ChatSDKError('unauthorized:document').toResponse();
	}

	const documents = await getDocumentsById({ id });

	const [document] = documents;

	if (document.userId !== session.userId) {
		return new ChatSDKError('forbidden:document').toResponse();
	}

	const documentsDeleted = await deleteDocumentsByIdAfterTimestamp({
		id,
		timestamp: new Date(timestamp)
	});

	return json(documentsDeleted);
}
