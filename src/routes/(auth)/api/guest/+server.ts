import { json } from "@sveltejs/kit";

export const GET = async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirectUrl') || '/';


    //   const token = await getToken({
    //       req: request,
    //       secret: process.env.AUTH_SECRET,
    //       secureCookie: !isDevelopmentEnvironment,
    //   });

    //   if (token) {
    //       return NextResponse.redirect(new URL('/', request.url));
    //   }

    //   return signIn('guest', { redirect: true, redirectTo: redirectUrl });

};