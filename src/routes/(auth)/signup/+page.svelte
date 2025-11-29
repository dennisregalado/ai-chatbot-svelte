<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	import { magicLink } from '../+layout.svelte';
</script>

<Field.Set>
	<h1 class="text-center text-xl font-bold">Sign up for v0</h1>
	{@render magicLink()}
	<Field.Description class="text-center">
		Already have an account? <a href="/signin">Sign in</a>
	</Field.Description>
</Field.Set>
