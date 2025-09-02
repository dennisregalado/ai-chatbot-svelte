<script lang="ts">
	import type { ToolUIPart } from 'ai';
	import { Badge } from '$lib/components/ui/badge';
	import { CollapsibleTrigger } from '$lib/components/ui/collapsible';
	import { cn } from '$lib/utils';
	import { CheckCircle, ChevronDown, Circle, Clock, Wrench, XCircle } from '@lucide/svelte';

	let {
		type,
		state,
		class: className,
		...props
	}: {
		type: ToolUIPart['type'];
		state: ToolUIPart['state'];
		class?: string;
	} = $props();

	const getStatusBadge = (status: ToolUIPart['state']) => {
		const labels = {
			'input-streaming': 'Pending',
			'input-available': 'Running',
			'output-available': 'Completed',
			'output-error': 'Error'
		} as const;

		const iconComponents = {
			'input-streaming': Circle,
			'input-available': Clock,
			'output-available': CheckCircle,
			'output-error': XCircle
		} as const;

		const iconClasses = {
			'input-streaming': 'size-4',
			'input-available': 'size-4 animate-pulse',
			'output-available': 'size-4 text-green-600',
			'output-error': 'size-4 text-red-600'
		} as const;

		return {
			label: labels[status],
			Icon: iconComponents[status],
			iconClass: iconClasses[status]
		};
	};

	const statusBadge = $derived(getStatusBadge(state));
</script>

<CollapsibleTrigger
	class={cn('flex w-full items-center justify-between gap-4 p-3', className)}
	{...props}
>
	<div class="flex items-center gap-2">
		<Wrench class="size-4 text-muted-foreground" />
		<span class="text-sm font-medium">{type}</span>
		<Badge class="gap-1.5 rounded-full text-xs" variant="secondary">
			<statusBadge.Icon class={statusBadge.iconClass} />
			{statusBadge.label}
		</Badge>
	</div>
	<ChevronDown
		class="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
	/>
</CollapsibleTrigger>
