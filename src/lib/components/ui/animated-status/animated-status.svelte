<script lang="ts">
	import { fade, fly, scale, blur } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { Shimmer } from '$lib/components/ai-elements/shimmer';
	import type { HTMLAttributes } from 'svelte/elements';

	type Variant = 'fade' | 'slide' | 'scale' | 'blur-fade';

	interface AnimatedStatusProps extends HTMLAttributes<HTMLDivElement> {
		text: string | null;
		shimmerDuration?: number;
		class?: string;
		fadeDuration?: number;
		/** Animation variant for status changes */
		variant?: Variant;
	}

	let {
		text,
		shimmerDuration = 2,
		class: className,
		fadeDuration = 200,
		variant = 'blur-fade',
		...rest
	}: AnimatedStatusProps = $props();

	// Get transition config based on variant
	function getTransition(variant: Variant) {
		const duration = fadeDuration;
		const easing = cubicInOut;

		switch (variant) {
			case 'fade':
				return { transition: fade, params: { duration, easing } };
			case 'slide':
				return { transition: fly, params: { x: 10, duration, easing } };
			case 'scale':
				return { transition: scale, params: { start: 0.95, duration, easing } };
			case 'blur-fade':
				return { transition: blur, params: { amount: 4, duration, easing } };
			default:
				return { transition: fade, params: { duration, easing } };
		}
	}

	const transitionConfig = $derived(getTransition(variant));
</script>

<div class="relative flex h-8 items-center whitespace-nowrap" {...rest}>
	{#key text}
		{#if text}
			<div
				in:transitionConfig.transition={transitionConfig.params}
				out:transitionConfig.transition={transitionConfig.params}
				class="flex items-center gap-1.5 text-muted-foreground dark:text-[#666666]"
			>
				<Shimmer class={className} duration={shimmerDuration} content_length={text.length}>
					{text}
				</Shimmer>
			</div>
		{/if}
	{/key}
</div>






