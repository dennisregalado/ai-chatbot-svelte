<script lang="ts">
	import Chat from '$lib/components/chat.svelte';
	import { DEFAULT_CHAT_MODEL } from '$lib/ai/models';
	
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
			isReadonly={false}
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
			isReadonly={false}
			{session}
			autoResume={false}
		/>
	{/key}
{/if}
<!-- TODO <DataStreamHandler {id} /> -->
