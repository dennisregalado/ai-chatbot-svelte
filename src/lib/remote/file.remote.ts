import { put } from '@vercel/blob';
import { z } from 'zod';
import { form, getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';

export const uploadFile = form(
	z.object({
		file: z
			.instanceof(File)
			.refine((file) => file.size <= 5 * 1024 * 1024, {
				message: 'File size should be less than 5MB'
			})
			// Update the file type based on the kind of files you want to accept
			.refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
				message: 'File type should be JPEG or PNG'
			})
	}),
	async ({ file }) => {
		const {
			locals: { session }
		} = getRequestEvent();

		if (!session) {
			error(401, 'Unauthorized');
		}

		try {
			if (!file) {
				error(400, 'No file uploaded');
			}

			const filename = file.name;
			const fileBuffer = await file.arrayBuffer();

			try {
				const data = await put(filename, fileBuffer, {
					access: 'public',
					token: BLOB_READ_WRITE_TOKEN
				});

				return data;
			} catch {
				error(500, 'Upload failed');
			}
		} catch {
			error(500, 'Failed to process request');
		}
	}
);
