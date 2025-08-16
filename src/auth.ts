import { SvelteKitAuth } from "@auth/sveltekit"

export const { handle } = SvelteKitAuth({
    providers: [],
    pages: {
        signIn: '/login',
        newUser: '/',
    },
})