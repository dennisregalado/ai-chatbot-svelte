<script lang="ts" module>
  import type { ToolUIPart } from 'ai';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  
  export type ToolProps = HTMLAttributes<HTMLDivElement>;
  
  export type ToolHeaderProps = {
    type: ToolUIPart['type'];
    state: ToolUIPart['state'];
  } & HTMLAttributes<HTMLButtonElement>;
  
  export type ToolContentProps = HTMLAttributes<HTMLDivElement>;
  
  export type ToolInputProps = {
    input: ToolUIPart['input'];
  } & HTMLAttributes<HTMLDivElement>;
  
  export type ToolOutputProps = {
    output: Snippet;
    errorText: ToolUIPart['errorText'];
  } & HTMLAttributes<HTMLDivElement>;
</script>

<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
  } from '$lib/components/ui/collapsible';
  import { cn } from '$lib/utils';
  import {
    CheckCircle,
    ChevronDown,
    Circle,
    Clock,
    Wrench,
    XCircle,
  } from '@lucide/svelte';
  import CodeBlock from '$lib/components/code-block.svelte';

  const getStatusBadge = (status: ToolUIPart['state']) => {
    const labels = {
      'input-streaming': 'Pending',
      'input-available': 'Running',
      'output-available': 'Completed',
      'output-error': 'Error',
    } as const;

    const iconComponents = {
      'input-streaming': Circle,
      'input-available': Clock,
      'output-available': CheckCircle,
      'output-error': XCircle,
    } as const;

    const iconClasses = {
      'input-streaming': 'size-4',
      'input-available': 'size-4 animate-pulse',
      'output-available': 'size-4 text-green-600',
      'output-error': 'size-4 text-red-600',
    } as const;

    return { 
      label: labels[status], 
      Icon: iconComponents[status],
      iconClass: iconClasses[status]
    };
  };
</script>

{#snippet Tool(props: ToolProps)}
  <Collapsible
    class={cn('not-prose mb-4 w-full rounded-md border', props.class)}
    {...props}
  />
{/snippet}

{#snippet ToolHeader(props: ToolHeaderProps)}
  {@const { type, state, class: className, ...restProps } = props}
  {@const statusBadge = getStatusBadge(state)}
  <CollapsibleTrigger
    class={cn(
      'flex w-full items-center justify-between gap-4 p-3',
      className,
    )}
    {...restProps}
  >
    <div class="flex items-center gap-2">
      <Wrench class="size-4 text-muted-foreground" />
      <span class="font-medium text-sm">{type}</span>
      <Badge class="rounded-full text-xs" variant="secondary">
        <svelte:component this={statusBadge.Icon} class={statusBadge.iconClass} />
        {statusBadge.label}
      </Badge>
    </div>
    <ChevronDown class="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
  </CollapsibleTrigger>
{/snippet}

{#snippet ToolContent(props: ToolContentProps)}
  <CollapsibleContent
    class={cn(
      'data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
      props.class,
    )}
    {...props}
  />
{/snippet}

{#snippet ToolInput(props: ToolInputProps)}
  {@const { input, class: className, ...restProps } = props}
  <div class={cn('space-y-2 overflow-hidden p-4', className)} {...restProps}>
    <h4 class="font-medium text-muted-foreground text-xs uppercase tracking-wide">
      Parameters
    </h4>
    <div class="rounded-md bg-muted/50">
      <CodeBlock>
        <pre><code>{JSON.stringify(input, null, 2)}</code></pre>
      </CodeBlock>
    </div>
  </div>
{/snippet}

{#snippet ToolOutput(props: ToolOutputProps)}
  {@const { output, errorText, class: className, ...restProps } = props}
  {#if output || errorText}
    <div class={cn('space-y-2 p-4', className)} {...restProps}>
      <h4 class="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {errorText ? 'Error' : 'Result'}
      </h4>
      <div
        class={cn(
          'overflow-x-auto rounded-md text-xs [&_table]:w-full',
          errorText
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted/50 text-foreground',
        )}
      >
        {#if errorText}
          <div>{errorText}</div>
        {/if}
        {#if output}
          <div>{@render output()}</div>
        {/if}
      </div>
    </div>
  {/if}
{/snippet}
