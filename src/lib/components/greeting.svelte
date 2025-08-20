<script lang="ts">
	import { fly } from 'svelte/transition';
</script>

<div class="mx-auto flex size-full max-w-3xl flex-col justify-center px-8 md:mt-20">
	<div
		in:fly={{ y: 10, delay: 500, opacity: 0 }}
		out:fly={{ y: 10, opacity: 0 }}
		class="text-2xl font-semibold"
	>
		Hello there!
	</div>
	<div
		in:fly={{ y: 10, delay: 600, opacity: 0 }}
		out:fly={{ y: 10, opacity: 0 }}
		class="text-2xl text-zinc-500"
	>
		How can I help you today?
	</div>
</div>
