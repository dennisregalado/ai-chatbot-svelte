<script lang="ts">
	import Chat from '$components/chat.svelte';
	import { DEFAULT_CHAT_MODEL } from '$ai/models';

	let { data } = $props();
	let { modelIdFromCookie, id, session } = $derived(data);
</script>

{#if !modelIdFromCookie}
	{#key id}
		<Chat
			{id}
			initialMessages={[]}
			initialChatModel={DEFAULT_CHAT_MODEL}
			initialVisibilityType="private"
			readonly={false}
			{session}
			autoResume={false}
		/>
	{/key}
{:else}
	{#key id}
		<Chat
			{id}
			initialMessages={[]}
			initialChatModel={modelIdFromCookie}
			initialVisibilityType="private"
			readonly={false}
			{session}
			autoResume={false}
		/>
	{/key}
{/if}
<!-- TODO <DataStreamHandler {id} /> -->
