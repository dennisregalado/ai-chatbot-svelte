<script lang="ts">
	import type { UIMessage } from '@ai-sdk/svelte';

	let {
		chatId,
		message,
		readonly,
		loading
	}: {
		chatId: string;
		message: UIMessage;
		readonly: boolean;
		loading: boolean;
	} = $props();
</script>
