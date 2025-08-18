import { put } from '@vercel/blob';
import { z } from 'zod';
import { form, getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';

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

export const uploadFile = form(async (data) => {
    const { locals: { session } } = getRequestEvent()

    if (!session) {
        error(401, 'Unauthorized');
    }

    try {
        const file = data.get('file') as Blob;

        if (!file) {
            error(400, 'No file uploaded');
        }

        const validatedFile = FileSchema.safeParse({ file });

        if (!validatedFile.success) {
            error(400, 'Invalid file');
        }

        // Get filename from formData since Blob doesn't have name property
        const filename = (data.get('file') as File).name;
        const fileBuffer = await file.arrayBuffer();

        try {
            const data = await put(`${filename}`, fileBuffer, {
                access: 'public'
            });

            return data;
        } catch {
            error(500, 'Upload failed');
        }
    } catch {
        error(500, 'Failed to process request');
    }
})