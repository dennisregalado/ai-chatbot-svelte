<script lang="ts">
	import '../app.css';
	import { ThemeProvider } from '@sejohnson/svelte-themes';
	import { Toaster } from '$components/ui/sonner';

	let { children } = $props();
</script>

<svelte:head>
	<title>SvelteKit Chatbot Template</title>
	<meta name="description" content="Svelte chatbot template using the AI SDK." />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
</svelte:head>

<ThemeProvider attribute="class" disableTransitionOnChange>
	<Toaster position="top-center" />
	{@render children()}
</ThemeProvider>
