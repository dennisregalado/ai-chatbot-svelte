import type { Reroute } from '@sveltejs/kit';

const redirectTo: Record<string, string> = {
    '/': '/home',
};

export const reroute: Reroute = ({ url }) => {
    console.log('rerouting');
    console.log(url.pathname);
    if (url.pathname in redirectTo) {
        console.log(redirectTo[url.pathname]);
        return redirectTo[url.pathname];
    }
};