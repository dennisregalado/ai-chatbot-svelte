<script lang="ts">
	import Chat from '$components/chat.svelte';
	import { getUser } from '$remote/auth.remote';

	let user = await getUser();
</script>

<Chat id={`${user?.id}-welcome`} />
