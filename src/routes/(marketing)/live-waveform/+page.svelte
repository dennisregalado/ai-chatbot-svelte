<script lang="ts">
	import { LiveWaveform } from '$lib/components/ai-elements/live-waveform';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';

	let active = $state(false);
	let processing = $state(false);
	let mode = $state<'static' | 'scrolling'>('static');

	const handleToggleActive = () => {
		active = !active;
		if (!active) {
			processing = false;
		}
	};

	const handleToggleProcessing = () => {
		processing = !processing;
		if (!processing) {
			active = false;
		}
	};
</script>

<Card class="w-full">
	<CardHeader>
		<CardTitle>Live Audio Waveform</CardTitle>
		<CardDescription>
			Real-time microphone input visualization with audio reactivity
		</CardDescription>
	</CardHeader>
	<CardContent class="space-y-4">
		<LiveWaveform
			{active}
			{processing}
			height={80}
			barWidth={3}
			barGap={2}
			{mode}
			fadeEdges={true}
			barColor="gray"
			historySize={120}
		/>
		<div class="flex flex-wrap justify-center gap-2">
			<Button size="sm" variant={active ? 'default' : 'outline'} onclick={handleToggleActive}>
				{active ? 'Stop' : 'Start'} Listening
			</Button>
			<Button
				size="sm"
				variant={processing ? 'default' : 'outline'}
				onclick={handleToggleProcessing}
			>
				{processing ? 'Stop' : 'Start'} Processing
			</Button>
			<Button
				size="sm"
				variant="outline"
				onclick={() => (mode = mode === 'static' ? 'scrolling' : 'static')}
			>
				Mode: {mode === 'static' ? 'Static' : 'Scrolling'}
			</Button>
		</div>
	</CardContent>
</Card>
