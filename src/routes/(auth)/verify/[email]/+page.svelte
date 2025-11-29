<script lang="ts">
	import { signInMagicLink } from '$remote/auth.remote';
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';
	import * as Field from '$lib/components/ui/field';
	import { magicLink } from '../../+layout.svelte';


	let { params } = $props();

</script>
 
	<Field.Set>
		<h1 class="text-xl font-bold text-center">Check your inbox</h1>
		{@render magicLink({ disabled: true, placeholder: params.email, text: 'Resend link' })}
	<Field.Description class="text-center">
		Already have an account? <a href="/signin">Sign in</a>
	</Field.Description>
	</Field.Set> 
