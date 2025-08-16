import { put } from '@vercel/blob';
import { z } from 'zod';
import { error, json } from '@sveltejs/kit';

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
	file: z
		.instanceof(Blob)
		.refine((file) => file.size <= 5 * 1024 * 1024, {
			message: 'File size should be less than 5MB'
		})
		// Update the file type based on the kind of files you want to accept
		.refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
			message: 'File type should be JPEG or PNG'
		})
});

export async function POST({ request, locals: { session } }) {
	if (!session) {
		error(401, 'Unauthorized');
	}

	if (request.body === null) {
		error(400, 'Request body is empty');
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as Blob;

		if (!file) {
			return error(400, 'No file uploaded');
		}

		const validatedFile = FileSchema.safeParse({ file });

		if (!validatedFile.success) {
			return error(400, 'Invalid file');
		}

		// Get filename from formData since Blob doesn't have name property
		const filename = (formData.get('file') as File).name;
		const fileBuffer = await file.arrayBuffer();

		try {
			const data = await put(`${filename}`, fileBuffer, {
				access: 'public'
			});

			return json(data);
		} catch {
			return error(500, 'Upload failed');
		}
	} catch {
		return error(500, 'Failed to process request');
	}
}
