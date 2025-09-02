<script lang="ts" module>
	export { documentSkeleton, inlineDocumentSkeleton };
</script>

<script lang="ts">
	import type { ArtifactKind } from './artifact.svelte';
</script>

{#snippet documentSkeleton({ artifactKind }: { artifactKind: ArtifactKind })}
	{#if artifactKind === 'image'}
		<div class="flex h-[calc(100dvh-60px)] w-full flex-col items-center justify-center gap-4">
			<div class="size-96 animate-pulse rounded-lg bg-muted-foreground/20"></div>
		</div>
	{:else}
		<div class="flex w-full flex-col gap-4">
			<div class="h-12 w-1/2 animate-pulse rounded-lg bg-muted-foreground/20"></div>
			<div class="h-5 w-full animate-pulse rounded-lg bg-muted-foreground/20"></div>
			<div class="h-5 w-full animate-pulse rounded-lg bg-muted-foreground/20"></div>
			<div class="h-5 w-1/3 animate-pulse rounded-lg bg-muted-foreground/20"></div>
			<div class="h-5 w-52 animate-pulse rounded-lg bg-transparent"></div>
			<div class="h-8 w-52 animate-pulse rounded-lg bg-muted-foreground/20"></div>
			<div class="h-5 w-2/3 animate-pulse rounded-lg bg-muted-foreground/20"></div>
		</div>
	{/if}
{/snippet}

{#snippet inlineDocumentSkeleton()}
	<div class="flex w-full flex-col gap-4">
		<div class="h-4 w-48 animate-pulse rounded-lg bg-muted-foreground/20"></div>
		<div class="h-4 w-3/4 animate-pulse rounded-lg bg-muted-foreground/20"></div>
		<div class="h-4 w-1/2 animate-pulse rounded-lg bg-muted-foreground/20"></div>
		<div class="h-4 w-64 animate-pulse rounded-lg bg-muted-foreground/20"></div>
		<div class="h-4 w-40 animate-pulse rounded-lg bg-muted-foreground/20"></div>
		<div class="h-4 w-36 animate-pulse rounded-lg bg-muted-foreground/20"></div>
		<div class="h-4 w-64 animate-pulse rounded-lg bg-muted-foreground/20"></div>
	</div>
{/snippet}
