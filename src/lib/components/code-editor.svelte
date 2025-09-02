<script lang="ts">
	import { EditorView } from '@codemirror/view';
	import { EditorState, Transaction } from '@codemirror/state';
	import { python } from '@codemirror/lang-python';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { basicSetup } from 'codemirror';
	import type { Suggestion } from '$server/db/schema';

	interface Props {
		content: string;
		onSaveContent: (updatedContent: string, debounce: boolean) => void;
		status: 'streaming' | 'idle';
		isCurrentVersion: boolean;
		currentVersionIndex: number;
		suggestions: Array<Suggestion>;
	}

	let { content, onSaveContent, status }: Props = $props();

	let containerEl = $state<HTMLDivElement>();
	let editorView = $state<EditorView | null>(null);

	// Initialize editor on mount
	$effect(() => {
		if (containerEl && !editorView) {
			const startState = EditorState.create({
				doc: content,
				extensions: [basicSetup, python(), oneDark]
			});

			editorView = new EditorView({
				state: startState,
				parent: containerEl
			});
		}

		return () => {
			if (editorView) {
				editorView.destroy();
				editorView = null;
			}
		};
	});

	// Update the content when props change
	$effect(() => {
		if (editorView && content) {
			const currentContent = editorView.state.doc.toString();

			if (status === 'streaming' || currentContent !== content) {
				const transaction = editorView.state.update({
					changes: {
						from: 0,
						to: currentContent.length,
						insert: content
					},
					annotations: [Transaction.remote.of(true)]
				});

				editorView.dispatch(transaction);
			}
		}
	});

	// Setup update listener when onSaveContent changes
	$effect(() => {
		if (editorView && onSaveContent) {
			const updateListener = EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const transaction = update.transactions.find((tr) => !tr.annotation(Transaction.remote));

					if (transaction) {
						const newContent = update.state.doc.toString();
						onSaveContent(newContent, true);
					}
				}
			});

			const currentSelection = editorView.state.selection;

			const newState = EditorState.create({
				doc: editorView.state.doc,
				extensions: [basicSetup, python(), oneDark, updateListener],
				selection: currentSelection
			});

			editorView.setState(newState);
		}
	});
</script>

<div class="not-prose relative w-full pb-[calc(80dvh)] text-sm" bind:this={containerEl}></div>
