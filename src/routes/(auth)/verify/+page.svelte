<script lang="ts">
	import { signInMagicLink } from '$remote/auth.remote';
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';
	import * as Field from '$lib/components/ui/field';

	let loading = $derived(signInMagicLink.pending > 0);
</script>
 
	<Field.Set>
		<h1 class="text-xl font-bold text-center">Check your inbox</h1>
		<Field.Group class="gap-2.5">
			<Button type="submit" disabled>
				{#if loading}
					<Spinner />
				{/if}
				Resend link
			</Button>
		</Field.Group>
		<Field.Description class="text-center">
			Already have an account? <a href="/signin">Log in</a>
		</Field.Description>
	</Field.Set> 
