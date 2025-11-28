<script lang="ts">
	import { signInMagicLink } from '$remote/auth.remote'; 
	import { Input } from '$components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';
	import * as Field from '$lib/components/ui/field';
	import { getLastLoginMethod } from '$remote/auth.remote';
	import { Badge } from '$lib/components/ui/badge';
	
	let lastLoginMethod = await getLastLoginMethod();
	let loading = $derived(signInMagicLink.pending > 0); 

	const { email } = signInMagicLink.fields
</script>

<form
	{...signInMagicLink}
	oninput={() => signInMagicLink.validate()}
> 
		<Field.Set>
			<h1 class="text-2xl font-bold text-center">Sign in to v0</h1>
			<Field.Group class="gap-3">
				<Field.Field>
					<Input id="email" type="email" placeholder="tim@apple.com" {...email.as('text')} />
				</Field.Field>
				<Button type="submit" disabled={loading}>
					{#if loading}
						<Spinner />
					{/if}
					Continue with email
					{#if lastLoginMethod === "email"}
						<Badge class="bg-pink-200 text-pink-600 absolute -top-2.5 -right-2.5" variant="secondary">
							Last used
						</Badge>
					{/if}
				</Button>
			</Field.Group>
			<Field.Description class="text-center">
				Don't have an account? <a href="/signup">Sign up</a>
			</Field.Description>
		</Field.Set>  
</form>
 