import { DEFAULT_CHAT_MODEL } from '$ai/models';

export async function load({ cookies, locals: { user, session } }) {
	return {
		isCollapsed: cookies.get('sidebar:state') !== 'true',
		selectedModelId: cookies.get('chat-model') ?? DEFAULT_CHAT_MODEL,
		session,
		user
	};
}
