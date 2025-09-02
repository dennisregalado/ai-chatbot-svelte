<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
  import { cn } from '$lib/utils';

  let {
    onclick,
    disabled,
    tooltip,
    children,
    class: className,
    ...props
  }: {
    onclick?: (event: MouseEvent) => void;
    disabled?: boolean;
    tooltip?: string;
    children?: any;
    class?: string;
  } = $props();
</script>

{#if tooltip}
  <Tooltip>
    <TooltipTrigger>
      <Button
        class={cn("h-8 w-8 p-0 hover:text-foreground", className)}
        {disabled}
        {onclick}
        size="sm"
        variant="ghost"
        {...props}
      >
        {@render children?.()}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
{:else}
  <Button
    class={cn("h-8 w-8 p-0 hover:text-foreground", className)}
    {disabled}
    {onclick}
    size="sm"
    variant="ghost"
    {...props}
  >
    {@render children?.()}
  </Button>
{/if}
