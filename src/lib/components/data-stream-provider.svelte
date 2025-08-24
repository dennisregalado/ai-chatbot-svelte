<script module lang="ts">
	import { getContext } from 'svelte';
	import type { DataUIPart } from 'ai';
	import type { CustomUIDataTypes } from '$lib/types';

	interface DataStreamContextValue {
		dataStream: DataUIPart<CustomUIDataTypes>[];
		setDataStream: (
			stream:
				| DataUIPart<CustomUIDataTypes>[]
				| ((prev: DataUIPart<CustomUIDataTypes>[]) => DataUIPart<CustomUIDataTypes>[])
		) => void;
	}

	const DATA_STREAM_CONTEXT_KEY = Symbol('data-stream');

	export function useDataStream(): DataStreamContextValue {
		const context = getContext<DataStreamContextValue>(DATA_STREAM_CONTEXT_KEY);
		if (!context) {
			throw new Error('useDataStream must be used within a DataStreamProvider');
		}
		return context;
	}
</script>

<script lang="ts">
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	// Use Svelte 5's $state rune for reactive state
	let dataStream = $state<DataUIPart<CustomUIDataTypes>[]>([]);

	// Create context value with methods to update the state
	const value: DataStreamContextValue = {
		get dataStream() {
			return dataStream;
		},
		setDataStream: (
			stream:
				| DataUIPart<CustomUIDataTypes>[]
				| ((prev: DataUIPart<CustomUIDataTypes>[]) => DataUIPart<CustomUIDataTypes>[])
		) => {
			if (typeof stream === 'function') {
				dataStream = stream(dataStream);
			} else {
				dataStream = stream;
			}
		}
	};

	// Set the context
	setContext(DATA_STREAM_CONTEXT_KEY, value);
</script>

{@render children()}
