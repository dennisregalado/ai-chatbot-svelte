<script lang="ts">
	import Chat from '$components/chat.svelte';

	let { data } = $props();
	let { id } = $derived(data);
</script>

<svelte:boundary>
	{#snippet pending()}{/snippet}
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
</svelte:boundary>
