<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { magicLink } from '../../+layout.svelte';

	let { params } = $props();
</script>

<Field.Set>
	<h1 class="text-center text-xl font-bold">Check your inbox</h1>
	{@render magicLink({ disabled: true, placeholder: params.email, text: 'Resend link' })}
	<Field.Description class="text-center">
		<a href="/signin">Resend email</a> in the next 30 seconds
	</Field.Description>
</Field.Set>
