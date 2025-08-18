 
export async function load({ params: { id }, locals: { session }, cookies }) {
	return { 
		chatModelFromCookie: cookies.get('chat-model'),
		session
	};
}
