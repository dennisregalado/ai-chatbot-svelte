import { getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import * as db from '$server/db/queries';
import { error } from '@sveltejs/kit';

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
