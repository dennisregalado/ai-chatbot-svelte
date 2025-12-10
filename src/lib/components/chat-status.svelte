<script lang="ts">
	import { AnimatedStatus } from '$lib/components/ui/animated-status';

	let { status }: { status: string } = $props();
</script>

<div class="flex h-8 items-center">
	{#if status}
		<AnimatedStatus
			text={status}
			shimmerDuration={0.75}
			fadeDuration={100}
			variant="scale"
			class="text-xs font-normal"
		/>
	{/if}
</div>
