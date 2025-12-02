<script lang="ts" module>
	export { magicLink };
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { getLastLoginMethod } from '$remote/auth.remote';
	import { signInGoogle } from '$remote/auth.remote';
	import { authClient } from '$lib/auth.client';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Spinner } from '$lib/components/ui/spinner';
	import * as Field from '$lib/components/ui/field';
	import { signInMagicLink } from '$remote/auth.remote';
	import { getActiveWorkspace } from '$remote/workspace.remote';
	import * as InputGroup from '$lib/components/ui/input-group';
	import CheckIcon from '@lucide/svelte/icons/check';

	let { children } = $props();

	onMount(async () => {
		await authClient.oneTap({
			fetchOptions: {
				onSuccess: async () => {
					const workspace = await getActiveWorkspace();

					if (workspace) {
						goto(`/${workspace.slug}`);
					}
				}
			}
		});
	});
</script>

<div
	class="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10"
>
	<div class="h-full w-full max-w-xs">
		<form
			class="flex flex-col gap-6"
			{...signInMagicLink}
			oninput={() => signInMagicLink.validate()}
		>
			{@render children()}
			<Field.Separator>Or</Field.Separator>
			{@render socialProviders()}
		</form>
	</div>
	<Field.Description class="absolute bottom-6 px-6 text-center text-xs text-balance">
		By continuing, you acknowledge & agree to the <a href="/terms"
			>Terms of Service</a
		>
		and
		<a href="/privacy">Privacy Policy</a>.
	</Field.Description>
</div>

{#snippet magicLink(
	{
		disabled = false,
		placeholder = 'tim@apple.com',
		text = 'Continue with email'
	}: { disabled?: boolean; placeholder?: string; text?: string } = {
		disabled: false,
		placeholder: 'tim@apple.com',
		text: 'Continue with email'
	}
)}
	<Field.Group class="gap-2.5">
		<Field.Field aria-invalid={signInMagicLink.fields.email.issues()?.length ? true : false}>
			{#each signInMagicLink.fields.email.issues() as issue}
				<Field.Error>{issue.message}</Field.Error>
			{/each}
			<InputGroup.Root data-disabled>
				<InputGroup.Input
					type="email"
					{...signInMagicLink.fields.email.as('text')}
					{placeholder}
					readonly={disabled}
				/>
				<InputGroup.Addon align="inline-end">
					{#if signInMagicLink.pending > 0}
						<Spinner />
					{/if}
					{#if page.url.pathname.includes('verify')}
						<CheckIcon />
					{/if}
				</InputGroup.Addon>
			</InputGroup.Root>
		</Field.Field>
		<Button type="submit" disabled={signInMagicLink.pending > 0}>
			{#if page.url.pathname.includes('verify')}
				We've sent you a link
			{:else}
				Continue with email
			{/if}
			{#if (await getLastLoginMethod()) === 'email' && text === 'Continue with email'}
				<Badge class="absolute -top-2.5 -right-2.5 bg-pink-200 text-pink-600" variant="secondary">
					Last used
				</Badge>
			{/if}
		</Button>
	</Field.Group>
{/snippet}

{#snippet socialProviders()}
	<Field.Field class="flex flex-col gap-2">
		<Button {...signInGoogle.buttonProps} class="relative" variant="outline" type="submit">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				viewBox="0 0 24 24"
				width="24"
				class="size-4"
			>
				<path
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					fill="#4285F4"
				></path>
				<path
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					fill="#34A853"
				></path>
				<path
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					fill="#FBBC05"
				></path>
				<path
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					fill="#EA4335"
				></path>
				<path d="M1 1h22v22H1z" fill="none"></path>
			</svg>
			Continue with Google
			{#if (await getLastLoginMethod()) === 'google'}
				<Badge class="absolute -top-2.5 -right-2.5 bg-pink-200 text-pink-600" variant="secondary">
					Last used
				</Badge>
			{/if}
		</Button>
		<Button
			class="relative"
			variant="outline"
			type="button"
			onclick={async () => {
				const { data, error } = await authClient.signIn.passkey({
					autoFill: true // Optional: Enables browser autofill for passkeys (e.g., biometric prompt)
				});
				console.log('data', data);
				console.log('error', error);
			}}
		>
			<svg
				aria-hidden="true"
				role="graphics-symbol"
				viewBox="3.68 2.37 15.23 17.3"
				class="size-4"
				><path
					d="M10 2.375c-1.137 0-2.054.47-2.674 1.242-.608.757-.9 1.765-.9 2.824s.292 2.066.9 2.824c.62.772 1.537 1.241 2.674 1.241s2.055-.469 2.675-1.241c.608-.758.9-1.766.9-2.824 0-1.059-.292-2.067-.9-2.824-.62-.773-1.538-1.242-2.675-1.242m0 9.255c-2.7 0-5.101 1.315-6.12 3.305-.361.706-.199 1.421.23 1.923.412.48 1.06.767 1.74.767h7.88v-1.79a3.96 3.96 0 0 1-1.439-3.876 8 8 0 0 0-2.291-.33m8.906 1.09a2.72 2.72 0 0 1-1.51 2.436v1.34l-.906 1.057.906 1.057-1.209 1.058-1.208-1.058v-3.454a2.719 2.719 0 1 1 3.927-2.436m-2.02-.604a.698.698 0 1 0-1.396 0 .698.698 0 0 0 1.395 0"
				></path></svg
			>
			Sign in with passkey
			{#if (await getLastLoginMethod()) === 'passkey'}
				<Badge class="absolute -top-2.5 -right-2.5 bg-pink-200 text-pink-600" variant="secondary">
					Last used
				</Badge>
			{/if}
		</Button>
	</Field.Field>
{/snippet}
