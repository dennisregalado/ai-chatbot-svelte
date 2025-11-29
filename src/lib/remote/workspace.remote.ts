import { command, form, getRequestEvent, query } from '$app/server';
import { error } from '@sveltejs/kit';
import type { User } from '$lib/auth';
import z from 'zod';

const workspaces = [
	{
		name: 'Evil Corp.',
		plan: 'Free',
		slug: 'evil-corp'
	},
	{
		name: 'Acme Corp.',
		plan: 'Pro',
		slug: 'acme-corp'
	},
	{
		name: 'Acme Inc',
		plan: 'Enterprise',
		slug: 'acme-inc'
	}
];

export const getWorkspace = query(z.string(), async (slug) => {
	const workspace = workspaces.find((workspace) => workspace.slug === slug);

	if (!workspace) {
		error(404, 'Workspace not found');
	}

	return workspace;
});

export const getWorkspaces = query(async () => {
	return workspaces;
});

export const getActiveWorkspace = query(async () => {
	const { locals } = getRequestEvent();
	const { user } = locals as { user: User };

	if (!user) {
		error(401, 'Unauthorized');
	}

	// temp just returm the first workspace
	const workspace = workspaces[1];

	if (!workspace) {
		error(404, 'Workspace not found');
	}

	return workspace;
});

export const updateWorkspace = form(
	z.object({
		slug: z.string(),
		name: z.string()
	}),
	async ({ slug, name }) => {
		const { locals } = getRequestEvent();
		const { user } = locals as { user: User };

		if (!user) {
			error(401, 'Unauthorized');
		}

		// temp just return true
		return true;
	}
);

export const createWorkspace = form(
	z.object({
		name: z.string()
	}),
	async ({ name }) => {
		const { locals } = getRequestEvent();
		const { user } = locals as { user: User };

		if (!user) {
			error(401, 'Unauthorized');
		}

		// temp just return true
		return true;
	}
);

export const deleteWorkspace = command(z.string(), async (slug) => {
	const { locals } = getRequestEvent();
	const { user } = locals as { user: User };

	if (!user) {
		error(401, 'Unauthorized');
	}

	// temp just return true
	return true;
});
