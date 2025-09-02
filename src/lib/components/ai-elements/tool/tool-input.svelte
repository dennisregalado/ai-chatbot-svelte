<script lang="ts">
  import type { ToolUIPart } from 'ai';
  import { cn } from '$lib/utils';
  import { CodeBlock, CodeBlockCopyButton } from '$lib/components/ai-elements/code-block';

  let {
    input,
    class: className,
    ...props
  }: {
    input: ToolUIPart['input'];
    class?: string;
  } = $props();
</script>

<div class={cn('space-y-2 overflow-hidden p-4', className)} {...props}>
  <h4 class="font-medium text-muted-foreground text-xs uppercase tracking-wide">
    Parameters
  </h4>
  <CodeBlock 
    code={JSON.stringify(input, null, 2)} 
    language="json"
  >
    <CodeBlockCopyButton />
  </CodeBlock>
</div>
