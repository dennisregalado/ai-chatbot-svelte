<script lang="ts">
	import { Highlight } from 'svelte-highlight';
	import { cn } from '$lib/utils.js';
	import { setCodeBlockContext } from './code-block-context.svelte.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
		code: string;
		language: string;
		showLineNumbers?: boolean;
		children?: Snippet;
		class?: string;
	}

	let {
		code,
		language,
		showLineNumbers = false,
		children,
		class: className,
		...restProps
	}: CodeBlockProps = $props();

	// Set up context for child components
	setCodeBlockContext({ code });
</script>

<div
	class={cn(
		'relative w-full overflow-hidden rounded-md border bg-background text-foreground',
		className
	)}
	{...restProps}
>
	<div class="relative">
		<!-- Light theme syntax highlighter -->
		<div class="overflow-hidden dark:hidden">
			<Highlight
				language={language as any}
				{code}
				class="font-mono text-sm"
				style="margin: 0; padding: 1rem; font-size: 0.875rem; background: hsl(var(--background)); color: hsl(var(--foreground));"
			/>
		</div>

		<!-- Dark theme syntax highlighter -->
		<div class="hidden overflow-hidden dark:block">
			<Highlight
				language={language as any}
				{code}
				class="font-mono text-sm"
				style="margin: 0; padding: 1rem; font-size: 0.875rem; background: hsl(var(--background)); color: hsl(var(--foreground));"
			/>
		</div>

		{#if children}
			<div class="absolute top-2 right-2 flex items-center gap-2">
				{@render children()}
			</div>
		{/if}
	</div>
</div>
