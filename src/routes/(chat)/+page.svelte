<script lang="ts">
	import Chat from '$components/chat.svelte';

	let { data } = $props();
	let { id } = $derived(data);
</script>

<svelte:boundary>
	{#snippet pending()}{/snippet}
	<Chat {id} />
</svelte:boundary>
