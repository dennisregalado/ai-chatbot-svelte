<script lang="ts">
	import Chat from '$components/chat.svelte';

	let { data } = $props();
	let { id } = $derived(data);
</script>

<Chat {id} />
