import { DUMMY_PASSWORD } from '$lib/constants';
import { createGuestUser, getUser } from '$server/db/queries';
import { SvelteKitAuth, type DefaultSession, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Credentials from '@auth/sveltekit/providers/credentials';
import { compare } from 'bcrypt-ts';

export type UserType = 'guest' | 'regular';

declare module '@auth/sveltekit' {
	interface Session extends DefaultSession {
		user: {
			id: string;
			type: UserType;
		} & DefaultSession['user'];
	}

	interface User {
		id?: string;
		email?: string | null;
		type: UserType;
	}
}

declare module '@auth/core/jwt' {
	interface JWT extends DefaultJWT {
		id: string;
		type: UserType;
	}
}

export const config: SvelteKitAuthConfig = {
	providers: [
		Credentials({
			credentials: {},
			async authorize({ email, password }: any) {
				const users = await getUser(email);

				if (users.length === 0) {
					await compare(password, DUMMY_PASSWORD);
					return null;
				}

				const [user] = users;

				if (!user.password) {
					await compare(password, DUMMY_PASSWORD);
					return null;
				}

				const passwordsMatch = await compare(password, user.password);

				if (!passwordsMatch) return null;

				return { ...user, type: 'regular' };
			}
		}),
		Credentials({
			id: 'guest',
			credentials: {},
			async authorize() {
				const [guestUser] = await createGuestUser();
				return { ...guestUser, type: 'guest' };
			}
		})
	],
	pages: {
		signIn: '/login',
		newUser: '/'
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id as string;
				token.type = user.type;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
				session.user.type = token.type;
			}

			return session;
		}
	}
};

export const { handle, signIn, signOut } = SvelteKitAuth(config);
