<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button, type ButtonVariant, type ButtonSize } from '$components/ui/button';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		children?: Snippet;
		title?: string;
	}

	let {
		variant = 'default',
		size = 'default',
		class: className,
		children,
		title = 'Explore More Plans'
	}: Props = $props();

	const plans = {
		free: {
			name: 'v0 Free',
			price: '$0',
			period: '/month',
			features: [
				'$5 of usage credit per month',
				'Deploy to Vercel',
				'Sync with GitHub',
				'Create up to 200 projects'
			],
			current: true
		},
		premium: {
			name: 'v0 Premium',
			price: '$20',
			period: '/month',
			features: [
				'$20 of usage credit per month',
				'Purchase additional credits outside your monthly limits',
				'Unlimited projects',
				'Access to v0-1.5-lg and v0 API'
			],
			current: false
		}
	};
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} {variant} {size} class={className}>
				{@render children?.()}
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-xl font-semibold">{title}</Dialog.Title>
			<Dialog.Description class="text-sm text-gray-600">
				You are currently on the v0 Free plan. Upgrade or start a new plan for monthly credit
				limits.
			</Dialog.Description>
		</Dialog.Header>

		<Tabs.Root value="free" class="w-full">
			<Tabs.List class="grid w-full grid-cols-2">
				{#each Object.entries(plans) as [planKey, plan]}
					<Tabs.Trigger value={planKey}>
						{planKey.charAt(0).toUpperCase() + planKey.slice(1)}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>

			{#each Object.entries(plans) as [planKey, plan]}
				<Tabs.Content value={planKey} class="space-y-4">
					<Card.Root>
						<Card.Content>
							<div class="space-y-4">
								<div>
									<h3 class="text-lg font-semibold">{plan.name}</h3>
									<div class="flex items-baseline">
										<span class="text-3xl font-bold">{plan.price}</span>
										<span class="ml-1 text-sm text-muted-foreground">{plan.period}</span>
									</div>
								</div>

								<div class="space-y-3">
									{#each plan.features as feature}
										<div class="flex items-center">
											<svg
												class="mr-3 h-4 w-4 flex-shrink-0 text-green-600"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fill-rule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												></path>
											</svg>
											<span class="text-sm">{feature}</span>
										</div>
									{/each}
								</div>

								{#if plan.current}
									<Button class="pointer-events-auto w-full cursor-not-allowed" variant="outline"
										>Current Plan</Button
									>
								{:else}
									<Button class="w-full">Upgrade to {plan.name}</Button>
								{/if}
							</div>
						</Card.Content>
					</Card.Root>
				</Tabs.Content>
			{/each}
		</Tabs.Root>

		<Dialog.Footer>
			<p class="text-sm text-muted-foreground">
				Compare plans and options on our
				<button
					type="button"
					class="inline-flex items-center gap-1 text-blue-600 underline underline-offset-4 hover:text-blue-500"
				>
					pricing page <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						></path></svg
					>
				</button>
				.
			</p>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
