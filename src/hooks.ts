import type { Reroute } from '@sveltejs/kit';

const redirectTo: Record<string, string> = {
	'/': '/home'
};

export const reroute: Reroute = ({ url }) => {
	if (url.pathname in redirectTo) {
		return redirectTo[url.pathname];
	}
};
