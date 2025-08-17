import { query } from '$app/server';
import { getSuggestionsByDocumentId } from '$server/db/queries';
import { z } from 'zod';

export const getSuggestions = query(
	z.object({ documentId: z.string() }),
	async ({ documentId }) => {
		const suggestions = await getSuggestionsByDocumentId({ documentId });
		return suggestions ?? [];
	}
);
