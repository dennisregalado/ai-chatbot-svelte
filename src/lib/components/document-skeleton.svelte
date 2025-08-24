<script lang="ts" module>
  export {
    documentSkeleton,
    inlineDocumentSkeleton
  };
</script>

<script lang="ts">
  import type { ArtifactKind } from './artifact.svelte';
</script>

{#snippet documentSkeleton({ artifactKind }: { artifactKind: ArtifactKind })}
  {#if artifactKind === 'image'}
    <div class="flex flex-col gap-4 w-full justify-center items-center h-[calc(100dvh-60px)]">
      <div class="animate-pulse rounded-lg bg-muted-foreground/20 size-96"></div>
    </div>
  {:else}
    <div class="flex flex-col gap-4 w-full">
      <div class="animate-pulse rounded-lg h-12 bg-muted-foreground/20 w-1/2"></div>
      <div class="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-full"></div>
      <div class="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-full"></div>
      <div class="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-1/3"></div>
      <div class="animate-pulse rounded-lg h-5 bg-transparent w-52"></div>
      <div class="animate-pulse rounded-lg h-8 bg-muted-foreground/20 w-52"></div>
      <div class="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-2/3"></div>
    </div>
  {/if}
{/snippet}

{#snippet inlineDocumentSkeleton()}
  <div class="flex flex-col gap-4 w-full">
    <div class="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-48"></div>
    <div class="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-3/4"></div>
    <div class="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-1/2"></div>
    <div class="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-64"></div>
    <div class="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-40"></div>
    <div class="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-36"></div>
    <div class="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-64"></div>
  </div>
{/snippet}
