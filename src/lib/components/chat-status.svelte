<script lang="ts">
	import { AnimatedStatus } from '$lib/components/ui/animated-status';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { getStatusMessage, getToolMessage } from '$lib/agent-utils';
	import type { AgentStatus } from '$lib/types/agents';

	interface ChatStatusProps {
		agentStatus: AgentStatus | null;
		currentToolCall: string | null;
		status?: string;
	}

	let { agentStatus, currentToolCall, status }: ChatStatusProps = $props();

	// Always prioritize tool message over agent status when a tool is running
	const displayMessage = $derived(getToolMessage(currentToolCall) || getStatusMessage(agentStatus));

	// Show spinner when we have agentStatus but no message, or when submitted with no status
	const showSpinner = $derived(
		(agentStatus && !getStatusMessage(agentStatus)) ||
			(status === 'submitted' && !agentStatus && !currentToolCall)
	);
</script>

<div class="flex h-8 items-center">
	<AnimatedStatus
		text={currentToolCall}
		shimmerDuration={0.75}
		fadeDuration={100}
		variant="scale"
		class="text-xs font-normal"
	/>
	{#if showSpinner}
		<Spinner class="size-3 text-muted-foreground" />
	{/if}
</div>
