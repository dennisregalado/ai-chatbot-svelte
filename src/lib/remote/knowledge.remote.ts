import { form, getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

/**
 * Create a text document in the knowledge base
 */
export const createText = form(
    z.object({
        textName: z.string().min(1, 'Text name is required').max(255, 'Text name must be less than 255 characters'),
        textContent: z.string().min(1, 'Text content is required')
    }),
    async ({ textName, textContent }) => {
        const { locals } = getRequestEvent();
        const { auth, user } = locals;

        if (!auth) {
            error(500, 'Auth not available');
        }

        if (!user) {
            error(401, 'Unauthorized');
        }

        try {
            return { success: true };
        } catch (e: any) {
            console.error('Failed to create text:', e);
            error(500, 'Failed to create text');
        }
    }
);

/**
 * Add files to the knowledge base
 * Supports multiple file types: epub, pdf, docx, txt, html, md
 * Accepts a single file or multiple files (frontend should use name="files" with multiple attribute)
 */
export const addFiles = form(
    z.object({
        files: z
            .instanceof(File)
            .array()
            .min(1, 'At least one file is required')
            .refine(
                (files) => {
                    const allowedTypes = [
                        'application/epub+zip',
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain',
                        'text/html',
                        'text/markdown'
                    ];
                    const allowedExtensions = ['.epub', '.pdf', '.docx', '.txt', '.html', '.md'];

                    return files.every((file) => {
                        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
                        return allowedTypes.includes(file.type) || allowedExtensions.includes(extension);
                    });
                },
                { message: 'Only epub, pdf, docx, txt, html, and md files are supported' }
            )
            .refine(
                (files) => {
                    const maxSize = 21 * 1024 * 1024; // 21 MB
                    return files.every((file) => file.size <= maxSize);
                },
                { message: 'Each file must be 21 MB or less' }
            )
    }),
    async ({ files }) => {
        const { locals } = getRequestEvent();
        const { auth, user } = locals;

        if (!auth) {
            error(500, 'Auth not available');
        }

        if (!user) {
            error(401, 'Unauthorized');
        }

        try {
            return { success: true };
        } catch (e: any) {
            console.error('Failed to add files:', e);
            error(500, e.message || 'Failed to add files');
        }
    }
);

/**
 * Add a URL to the knowledge base
 */
export const addUrl = form(
    z.object({
        url: z.url('Please enter a valid URL')
    }),
    async ({ url }) => {
        const { locals } = getRequestEvent();
        const { auth, user } = locals;

        if (!auth) {
            error(500, 'Auth not available');
        }

        if (!user) {
            error(401, 'Unauthorized');
        }

        try {
            await sleep(2000);
            return { success: true };
        } catch (e: any) {
            console.error('Failed to add URL:', e);
            error(500, 'Failed to add URL');
        }
    }
);


// sleep function
async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}