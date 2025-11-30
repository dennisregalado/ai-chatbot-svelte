import type { Reroute } from '@sveltejs/kit';

const redirectTo: Record<string, string> = {
    '/': '/home',
    '/welcome': '/welcome/profile',
};

export const reroute: Reroute = ({ url }) => { 
    
    if (url.pathname in redirectTo) {
        return redirectTo[url.pathname];
    }
};