<script lang="ts">
  import type { ToolUIPart } from 'ai';
  import { cn } from '$lib/utils';

  let {
    output,
    errorText,
    class: className,
    ...props
  }: {
    output?: any;
    errorText?: ToolUIPart['errorText'];
    class?: string;
  } = $props();
</script>

{#if output || errorText}
  <div class={cn('space-y-2 p-4', className)} {...props}>
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
        <div>{output}</div>
      {/if}
    </div>
  </div>
{/if}
