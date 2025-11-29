<script lang="ts"> 
	import * as Field from '$lib/components/ui/field';
	import { magicLink } from '../+layout.svelte';
</script>


<Field.Set>
	<h1 class="text-xl font-bold text-center">Sign in to v0</h1>
	{@render magicLink()}
	<Field.Description class="text-center">
		Don't have an account? <a href="/signup">Sign up</a>
	</Field.Description>
</Field.Set>