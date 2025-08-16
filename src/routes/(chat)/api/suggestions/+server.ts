import { getSuggestionsByDocumentId } from '$server/db/queries';
import { ChatSDKError } from '$lib/errors';
import { json } from '@sveltejs/kit';

export async function GET({ request, locals: { session } }) {
	const { searchParams } = new URL(request.url);
	const documentId = searchParams.get('documentId');

	if (!documentId) {
		return new ChatSDKError('bad_request:api', 'Parameter documentId is required.').toResponse();
	}

	if (!session?.userId) {
		return new ChatSDKError('unauthorized:suggestions').toResponse();
	}

	const suggestions = await getSuggestionsByDocumentId({
		documentId
	});

	const [suggestion] = suggestions;

	if (!suggestion) {
		return json([]);
	}

	if (suggestion.userId !== session.userId) {
		return new ChatSDKError('forbidden:api').toResponse();
	}

	return json(suggestions);
}
