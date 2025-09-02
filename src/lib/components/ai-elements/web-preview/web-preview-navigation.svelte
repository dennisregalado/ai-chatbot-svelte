<script lang="ts">
  import { cn } from '$lib/utils';

  let {
    class: className,
    children,
    ...props
  }: {
    class?: string;
    children?: any;
  } = $props();
</script>

<div
  class={cn('flex items-center gap-1 border-b p-2', className)}
  {...props}
>
  {@render children?.()}
</div>
