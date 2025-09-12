<script lang="ts">
	import { signInEmail } from '$remote/auth.remote';
	import { Label } from '$components/ui/label';
	import { Input } from '$components/ui/input';
	import { Button } from '$components/ui/button';
	import { LoaderIcon } from '$components/icons.svelte';
	import { toast } from 'svelte-sonner';

	$effect(() => {
		if (signInEmail.result?.invalid) {
			toast.error(signInEmail.result.invalid);
		}
	});

	let loading = $derived(Boolean(signInEmail.pending));
</script>

<div
	class="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0"
>
	<div class="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
		<div class="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
			<h3 class="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
			<p class="text-sm text-muted-foreground dark:text-zinc-400">Use your email and password to sign in</p>
		</div>
		<form {...signInEmail} class="flex flex-col gap-4 px-4 sm:px-16">
			<div class="flex flex-col gap-2">
				<Label id="email" class="font-normal text-zinc-600 dark:text-zinc-400">Email Address</Label>
				<Input
					id="email"
					name="email"
					class="text-md bg-muted md:text-sm"
					type="email"
					placeholder="user@acme.com"
					autocomplete="email"
					required
					autofocus
				/>
			</div>
			<div class="flex flex-col gap-2">
				<Label id="password" class="font-normal text-zinc-600 dark:text-zinc-400">Password</Label>
				<Input
					id="password"
					name="password"
					class="text-md bg-muted md:text-sm"
					type="password"
					required
				/>
			</div>
			<Button
				type={loading ? 'button' : 'submit'}
				aria-disabled={loading}
				disabled={loading}
				class="relative"
			>
				Sign in

				{#if loading}
					<span class="absolute right-4 animate-spin">
						{@render LoaderIcon()}
					</span>
				{/if}

				<output aria-live="polite" class="sr-only">
					{loading ? 'Loading' : 'Submit form'}
				</output>
			</Button>
			<p class="mt-4 text-center text-sm text-gray-600 dark:text-zinc-400">
				Don't have an account?
				<a href="/register" class="font-semibold text-gray-800 hover:underline dark:text-zinc-200">
					Sign up
				</a>
				for free.
			</p>
		</form>
	</div>
</div>
