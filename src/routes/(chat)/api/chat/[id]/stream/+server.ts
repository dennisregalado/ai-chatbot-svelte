import type { VisibilityType } from '$components/visibility-selector.svelte';
import { updateChatVisiblityById } from '$server/db/queries';

export async function POST({ request }) {
	const { chatId, visibility }: { chatId: string; visibility: VisibilityType } =
		await request.json();
	// TODO: This definitely needs a user check too
	return updateChatVisiblityById({ chatId, visibility }).match(
		() => new Response('Chat visibility updated', { status: 200 }),
		() => new Response('An error occurred while processing your request', { status: 500 })
	);
}
