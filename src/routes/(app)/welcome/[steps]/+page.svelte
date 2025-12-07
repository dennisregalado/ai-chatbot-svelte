<script lang="ts">
	import Chat from '$components/chat.svelte';
	let { params } = $props();

	let id = $state<string>('welcome');
</script>

<Chat />
