<script lang="ts">
	import Chat from '$components/chat.svelte';
	import DataStreamHandler from '$components/data-stream-handler.svelte';

	let { data } = $props();
	let { id } = $derived(data);
</script>

<Chat {id} />
<DataStreamHandler />