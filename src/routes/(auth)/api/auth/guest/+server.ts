import { redirect } from "@sveltejs/kit";

import { getToken } from "@auth/core/jwt"
import { signIn } from "$lib/server/auth"
import { dev } from "$app/environment";
import { config } from "$lib/auth";
import { AUTH_SECRET } from "$env/static/private";

export const GET = async (event) => {
    const { request } = event;
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirectUrl') || '/';

    const token = await getToken({
        req: request,
        secret: AUTH_SECRET,
        secureCookie: !dev,
    });

    if (token) {
        redirect(307, new URL('/', request.url));
    }

    return signIn('guest', { redirect: true, redirectTo: redirectUrl }, {}, config, event);
};