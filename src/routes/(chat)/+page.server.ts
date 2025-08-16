import { generateUUID } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ locals: { user, session }, cookies }) {

    if (!user) {
        redirect(302, '/api/auth/guest');
    }

    const id = generateUUID();

    const modelIdFromCookie = cookies.get('chat-model');


    return {
        id,
        modelIdFromCookie,
        session
    }
}