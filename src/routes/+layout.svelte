<script lang="ts">
	import '../app.css';
	import { ThemeProvider } from '@sejohnson/svelte-themes';
	import { Toaster } from '$components/ui/sonner';

	let { children } = $props();
</script>

<svelte:head>
	<title>Svelte Chatbot Template</title>
	<meta name="description" content="Svelte chatbot template using the AI SDK." />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Baskervville:ital,wght@0,400..700;1,400..700&family=Geist:wght@100..900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<ThemeProvider attribute="class" disableTransitionOnChange>
	<Toaster position="top-center" />
	{@render children()}
</ThemeProvider>
