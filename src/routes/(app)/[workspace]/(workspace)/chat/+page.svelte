<script lang="ts">
	import Chat from '$components/chat.svelte';
	import { generateChatId } from '$remote/chat.remote';

	let id = await generateChatId();
</script>

<Chat {id} />
