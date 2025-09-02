<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';
  import { cn } from '$lib/utils';
  import { ChevronDownIcon } from '$lib/components/icons.svelte';
  import { useWebPreview } from './web-preview-context';

  export type LogEntry = {
    level: 'log' | 'warn' | 'error';
    message: string;
    timestamp: Date;
  };

  let {
    class: className,
    logs = [],
    children,
    ...props
  }: {
    class?: string;
    logs?: LogEntry[];
    children?: any;
  } = $props();

  const { consoleOpen, setConsoleOpen } = useWebPreview();
</script>

<Collapsible
  open={consoleOpen}
  onOpenChange={setConsoleOpen}
  class={cn('border-t bg-muted/50 font-mono text-sm', className)}
  {...props}
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
