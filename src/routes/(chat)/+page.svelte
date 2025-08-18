<script lang="ts">
	import Chat from '$components/chat.svelte';
	import { DEFAULT_CHAT_MODEL } from '$ai/models';

	let { data } = $props();
	let { id } = $derived(data);
</script>

{#key id}
	<Chat
		{id}
		initialMessages={[]}
		initialVisibilityType="private"
		readonly={false}
		autoResume={false}
	/>
{/key}
<!-- TODO <DataStreamHandler {id} /> -->
