<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { magicLink } from '../../+layout.svelte';

	let { params } = $props();
</script>

<Field.Set>
	<h1 class="text-center text-xl font-bold">Check your inbox</h1>
	{@render magicLink({ disabled: true, placeholder: params.email, text: 'Resend link' })}
	<Field.Description class="text-center">
		Already have an account? <a href="/signin">Sign in</a>
	</Field.Description>
</Field.Set>
