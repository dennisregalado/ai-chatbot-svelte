<script lang="ts">
	import Chat from '$components/chat.svelte';
	import DataStreamHandler from '$components/data-stream-handler.svelte';
	import { generateChatId } from '$remote/chat.remote';
	import { getWorkspace } from '$remote/workspace.remote';

	let { params } = $props();

	let workspace = $derived(await getWorkspace(params.workspace));

	let id = await generateChatId();
</script>

<Chat {id} visibility="private" />
<DataStreamHandler />
