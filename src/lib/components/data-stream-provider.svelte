<script module lang="ts">
	import { getContext } from 'svelte';
	import type { DataUIPart, CustomUIDataTypes } from '$lib/utils/types.js';

	interface DataStreamContextValue {
		dataStream: DataUIPart<CustomUIDataTypes>[];
		setDataStream: (stream: DataUIPart<CustomUIDataTypes>[]) => void;
		updateDataStream: (updater: (prev: DataUIPart<CustomUIDataTypes>[]) => DataUIPart<CustomUIDataTypes>[]) => void;
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
	const contextValue: DataStreamContextValue = {
		get dataStream() {
			return dataStream;
		},
		setDataStream: (stream: DataUIPart<CustomUIDataTypes>[]) => {
			dataStream = stream;
		},
		updateDataStream: (updater: (prev: DataUIPart<CustomUIDataTypes>[]) => DataUIPart<CustomUIDataTypes>[]) => {
			dataStream = updater(dataStream);
		}
	};

	// Set the context
	setContext(DATA_STREAM_CONTEXT_KEY, contextValue);
</script>

{@render children()}
