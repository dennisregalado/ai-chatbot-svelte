<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAttributes, HTMLIframeAttributes, HTMLInputAttributes } from 'svelte/elements';

	export type WebPreviewContextValue = {
		url: string;
		setUrl: (url: string) => void;
		consoleOpen: boolean;
		setConsoleOpen: (open: boolean) => void;
	};

	export type LogEntry = {
		level: 'log' | 'warn' | 'error';
		message: string;
		timestamp: Date;
	};

	export type WebPreviewProps = HTMLAttributes<HTMLDivElement> & {
		defaultUrl?: string;
		onUrlChange?: (url: string) => void;
	};

	export type WebPreviewNavigationProps = HTMLAttributes<HTMLDivElement>;

	export type WebPreviewNavigationButtonProps = HTMLButtonAttributes & {
		tooltip?: string;
	};

	export type WebPreviewUrlProps = HTMLInputAttributes;

	export type WebPreviewBodyProps = HTMLIframeAttributes & {
		loading?: Snippet;
	};

	export type WebPreviewConsoleProps = HTMLAttributes<HTMLDivElement> & {
		logs?: LogEntry[];
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { setContext, getContext } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';
	import { Input } from '$lib/components/ui/input';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
	import { ChevronDownIcon } from '$lib/components/icons.svelte';

	const WEB_PREVIEW_CONTEXT_KEY = Symbol('web-preview');

	function createWebPreviewContext(defaultUrl = '', onUrlChange?: (url: string) => void) {
		let url = $state(defaultUrl);
		let consoleOpen = $state(false);

		const setUrl = (newUrl: string) => {
			url = newUrl;
			onUrlChange?.(newUrl);
		};

		const setConsoleOpen = (open: boolean) => {
			consoleOpen = open;
		};

		const context = {
			get url() { return url; },
			setUrl,
			get consoleOpen() { return consoleOpen; },
			setConsoleOpen
		};

		setContext(WEB_PREVIEW_CONTEXT_KEY, context);
		return context;
	}

	function useWebPreview(): WebPreviewContextValue {
		const context = getContext<WebPreviewContextValue>(WEB_PREVIEW_CONTEXT_KEY);
		if (!context) {
			throw new Error('WebPreview components must be used within a WebPreview');
		}
		return context;
	}
</script>

<!-- Main WebPreview Container Component -->
{#snippet WebPreview(props: WebPreviewProps & { children: Snippet })}
	{@const { class: className, children, defaultUrl = '', onUrlChange, ...restProps } = props}
	{@const context = createWebPreviewContext(defaultUrl, onUrlChange)}
	<div
		class={cn(
			'flex size-full flex-col rounded-lg border bg-card',
			className,
		)}
		{...restProps}
	>
		{@render children()}
	</div>
{/snippet}

<!-- WebPreview Navigation -->
{#snippet WebPreviewNavigation(props: WebPreviewNavigationProps & { children: Snippet })}
	{@const { class: className, children, ...restProps } = props}
	<div
		class={cn('flex items-center gap-1 border-b p-2', className)}
		{...restProps}
	>
		{@render children()}
	</div>
{/snippet}

<!-- WebPreview Navigation Button -->
{#snippet WebPreviewNavigationButton(props: WebPreviewNavigationButtonProps & { children: Snippet; tooltip?: string })}
	{@const { onclick, disabled, tooltip, children, ...restProps } = props}
	{#if tooltip}
		<Tooltip>
			<TooltipTrigger>
				<Button
					class="h-8 w-8 p-0 hover:text-foreground"
					{disabled}
					{onclick}
					size="sm"
					variant="ghost"
					{...restProps}
				>
					{@render children()}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>{tooltip}</p>
			</TooltipContent>
		</Tooltip>
	{:else}
		<Button
			class="h-8 w-8 p-0 hover:text-foreground"
			{disabled}
			{onclick}
			size="sm"
			variant="ghost"
			{...restProps}
		>
			{@render children()}
		</Button>
	{/if}
{/snippet}

<!-- WebPreview URL Input -->
{#snippet WebPreviewUrl(props: WebPreviewUrlProps)}
	{@const { value, onchange, onkeydown, ...restProps } = props}
	{@const { url, setUrl } = useWebPreview()}

	{@const handleKeyDown = (event: Event) => {
		const keyboardEvent = event as KeyboardEvent;
		if (keyboardEvent.key === 'Enter') {
			const target = event.target as HTMLInputElement;
			setUrl(target.value);
		}
		onkeydown?.(event);
	}}

	<Input
		class="h-8 flex-1 text-sm"
		{onchange}
		onkeydown={handleKeyDown}
		placeholder="Enter URL..."
		value={value ?? url}
		{...restProps}
	/>
{/snippet}

<!-- WebPreview Body -->
{#snippet WebPreviewBody(props: WebPreviewBodyProps)}
	{@const { class: className, loading, src, ...restProps } = props}
	{@const { url } = useWebPreview()}

	<div class="flex-1">
		<iframe
			class={cn('size-full', className)}
			sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
			src={(src ?? url) || undefined}
			title="Preview"
			{...restProps}
		></iframe>
		{#if loading}
			{@render loading()}
		{/if}
	</div>
{/snippet}

<!-- WebPreview Console -->
{#snippet WebPreviewConsole(props: WebPreviewConsoleProps & { children?: Snippet })}
	{@const { class: className, logs = [], children, ...restProps } = props}
	{@const { consoleOpen, setConsoleOpen } = useWebPreview()}
	
	<Collapsible
		open={consoleOpen}
		onOpenChange={setConsoleOpen}
		class={cn('border-t bg-muted/50 font-mono text-sm', className)}
	>
		<CollapsibleTrigger>
			<Button
				class="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50"
				variant="ghost"
			>
				Console
				<div class={cn(
					'h-4 w-4 transition-transform duration-200',
					consoleOpen && 'rotate-180',
				)}>
					{@render ChevronDownIcon(16)}
				</div>
			</Button>
		</CollapsibleTrigger>
		<CollapsibleContent
			class={cn(
				'px-4 pb-4',
				'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
			)}
		>
			<div class="max-h-48 space-y-1 overflow-y-auto">
				{#if logs.length === 0}
					<p class="text-muted-foreground">No console output</p>
				{:else}
					{#each logs as log, index (log.timestamp.getTime() + '-' + index)}
						<div
							class={cn(
								'text-xs',
								log.level === 'error' && 'text-destructive',
								log.level === 'warn' && 'text-yellow-600',
								log.level === 'log' && 'text-foreground',
							)}
						>
							<span class="text-muted-foreground">
								{log.timestamp.toLocaleTimeString()}
							</span>{' '}
							{log.message}
						</div>
					{/each}
				{/if}
				{#if children}
					{@render children()}
				{/if}
			</div>
		</CollapsibleContent>
	</Collapsible>
{/snippet}

<!-- Export all snippets -->
<!-- Use this instead of the React file -->
{#snippet _export()}
	{WebPreview}
	{WebPreviewNavigation}
	{WebPreviewNavigationButton}
	{WebPreviewUrl}
	{WebPreviewBody}
	{WebPreviewConsole}
{/snippet}