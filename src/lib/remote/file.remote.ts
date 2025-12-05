import { query, command, form, getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

// Types based on better-auth-cloudflare R2 file structure
export interface FileMetadata {
	id: string;
	filename: string;
	size: number;
	contentType: string;
	userId: string;
	createdAt: Date;
	category?: string;
	isPublic?: boolean;
	description?: string;
}

export interface FileListResponse {
	files: FileMetadata[];
	nextCursor: string | null;
	hasMore: boolean;
}

export interface UploadMetadata {
	category?: string;
	isPublic?: boolean;
	description?: string;
}

/**
 * List user's files with pagination
 */
export const listFiles = query(
	z.object({
		limit: z.number().default(20),
		cursor: z.string().optional()
	}),
	async ({ limit, cursor }) => {
		const { request, locals } = getRequestEvent();
		const { auth } = locals;

		if (!auth) {
			error(500, 'Auth not available');
		}

		try {
			const response = await (auth.api as any).list({
				headers: request.headers,
				query: {
					...(limit !== undefined && { limit: limit.toString() }),
					...(cursor && { cursor })
				}
			});

			// Response might be wrapped in data property or be direct
			return (response.data || response) as FileListResponse;
		} catch (e: any) {
			console.error('Failed to list files:', e);
			error(500, e.message || 'Failed to list files');
		}
	}
);

/**
 * Get file metadata by ID
 */
export const getFile = query(
	z.object({
		fileId: z.string()
	}),
	async ({ fileId }) => {
		const { request, locals } = getRequestEvent();
		const { auth } = locals;

		if (!auth) {
			error(500, 'Auth not available');
		}

		try {
			const response = await (auth.api as any).get({
				headers: request.headers,
				body: {
					fileId
				}
			});

			// Response might be wrapped in data property or be direct
			return (response.data || response) as FileMetadata;
		} catch (e: any) {
			console.error('Failed to get file:', e);
			error(500, e.message || 'Failed to get file');
		}
	}
);

/**
 * Upload a file using form (recommended for HTML forms)
 * Use this with <form> elements - it handles File objects natively
 */
export const uploadFileForm = form(
	z.object({
		file: z.instanceof(File),
		category: z.string().optional(),
		isPublic: z.boolean().optional(),
		description: z.string().optional()
	}),
	async ({ file, category, isPublic, description }) => {
		const { request, locals } = getRequestEvent();
		const { auth } = locals;

		if (!auth) {
			error(500, 'Auth not available');
		}

		try {
			// Convert File to ArrayBuffer for the API
			const arrayBuffer = await file.arrayBuffer();

			// Prepare metadata
			const metadata: UploadMetadata = {};
			if (category) metadata.category = category;
			if (isPublic !== undefined) metadata.isPublic = isPublic;
			if (description) metadata.description = description;

			const response = await (auth.api as any).upload({
				headers: {
					...Object.fromEntries(request.headers.entries()),
					'x-filename': file.name,
					'x-file-metadata': JSON.stringify(metadata),
					'content-type': file.type
				},
				body: arrayBuffer
			});

			// Response might be wrapped in data property or be direct
			return (response.data || response) as FileMetadata;
		} catch (e: any) {
			console.error('Failed to upload file:', e);
			error(500, e.message || 'Failed to upload file');
		}
	}
);

/**
 * Upload a file programmatically (for use with command)
 * Accepts file data as ArrayBuffer (via Uint8Array) or base64 string
 */
export const uploadFile = command(
	z.object({
		filename: z.string(),
		contentType: z.string(),
		data: z.union([z.instanceof(Uint8Array), z.string()]), // ArrayBuffer as Uint8Array or base64 string
		category: z.string().optional(),
		isPublic: z.boolean().optional(),
		description: z.string().optional()
	}),
	async ({ filename, contentType, data, category, isPublic, description }) => {
		const { request, locals } = getRequestEvent();
		const { auth } = locals;

		if (!auth) {
			error(500, 'Auth not available');
		}

		try {
			// Convert data to ArrayBuffer
			let arrayBuffer: ArrayBuffer;
			if (typeof data === 'string') {
				// Assume base64 string
				const binaryString = atob(data);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}
				arrayBuffer = bytes.buffer;
			} else {
				arrayBuffer = data.buffer;
			}

			// Prepare metadata
			const metadata: UploadMetadata = {};
			if (category) metadata.category = category;
			if (isPublic !== undefined) metadata.isPublic = isPublic;
			if (description) metadata.description = description;

			const response = await (auth.api as any).upload({
				headers: {
					...Object.fromEntries(request.headers.entries()),
					'x-filename': filename,
					'x-file-metadata': JSON.stringify(metadata),
					'content-type': contentType
				},
				body: arrayBuffer
			});

			// Response might be wrapped in data property or be direct
			return (response.data || response) as FileMetadata;
		} catch (e: any) {
			console.error('Failed to upload file:', e);
			error(500, e.message || 'Failed to upload file');
		}
	}
);

/**
 * Download a file by ID
 * Returns the file as a Blob/Response
 */
export const downloadFile = command(
	z.object({
		fileId: z.string()
	}),
	async ({ fileId }) => {
		const { request, locals } = getRequestEvent();
		const { auth } = locals;

		if (!auth) {
			error(500, 'Auth not available');
		}

		try {
			const response = await (auth.api as any).download({
				headers: request.headers,
				body: {
					fileId
				}
			});

			// The download endpoint returns the file as binary data
			// We need to return it in a way that can be serialized
			if (response instanceof Response) {
				const blob = await response.blob();
				const arrayBuffer = await blob.arrayBuffer();
				return {
					data: Array.from(new Uint8Array(arrayBuffer)),
					contentType: blob.type,
					filename: response.headers.get('content-disposition')?.split('filename=')[1] || 'file'
				};
			}

			return response;
		} catch (e: any) {
			console.error('Failed to download file:', e);
			error(500, e.message || 'Failed to download file');
		}
	}
);

/**
 * Delete a file by ID
 */
export const deleteFile = command(
	z.object({
		fileId: z.string()
	}),
	async ({ fileId }) => {
		const { request, locals } = getRequestEvent();
		const { auth } = locals;

		if (!auth) {
			error(500, 'Auth not available');
		}

		try {
			await (auth.api as any).delete({
				headers: request.headers,
				body: {
					fileId
				}
			});

			return { success: true };
		} catch (e: any) {
			console.error('Failed to delete file:', e);
			error(500, e.message || 'Failed to delete file');
		}
	}
);
