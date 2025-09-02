<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { cn } from '$lib/utils';
  import { useWebPreview } from './web-preview-context';

  let {
    value,
    onchange,
    onkeydown,
    class: className,
    ...props
  }: {
    value?: string;
    onchange?: (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
    onkeydown?: (event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => void;
    class?: string;
  } = $props();

  const { url, setUrl } = useWebPreview();

  const handleKeyDown = (event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
    if (event.key === 'Enter') {
      const target = event.currentTarget;
      setUrl(target.value);
    }
    onkeydown?.(event);
  };
</script>

<Input
  class={cn("h-8 flex-1 text-sm", className)}
  {onchange}
  onkeydown={handleKeyDown}
  placeholder="Enter URL..."
  value={value ?? url}
  {...props}
/>
