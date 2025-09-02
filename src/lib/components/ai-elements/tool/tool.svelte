<script lang="ts">
  import { Collapsible } from '$lib/components/ui/collapsible';
  import { cn } from '$lib/utils';

  let {
    class: className,
    open,
    onOpenChange,
    children,
    ...props
  }: {
    class?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: any;
  } = $props();
</script>

<Collapsible
  class={cn('not-prose mb-4 w-full rounded-md border', className)}
  {open}
  {onOpenChange}
  {...props}
>
  {@render children?.()}
</Collapsible>