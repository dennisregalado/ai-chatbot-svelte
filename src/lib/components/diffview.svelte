<script lang="ts">
  // @ts-ignore
  import OrderedMap from 'orderedmap';
  // @ts-ignore
  import { Schema, DOMParser, type Node as ProsemirrorNode, type MarkSpec } from 'prosemirror-model';
  // @ts-ignore
  import { schema } from 'prosemirror-schema-basic';
  // @ts-ignore
  import { addListNodes } from 'prosemirror-schema-list';
  // @ts-ignore
  import { EditorState } from 'prosemirror-state';
  // @ts-ignore
  import { EditorView } from 'prosemirror-view';
  import { diffEditor, DiffType } from '$lib/editor/diff';

  const diffSchema = new Schema({
    nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
    marks: OrderedMap.from({
      ...schema.spec.marks.toObject(),
      diffMark: {
        attrs: { type: { default: '' } },
        toDOM(mark: any) {
          let className = '';

          switch (mark.attrs.type) {
            case DiffType.Inserted:
              className =
                'bg-green-100 text-green-700 dark:bg-green-500/70 dark:text-green-300';
              break;
            case DiffType.Deleted:
              className =
                'bg-red-100 line-through text-red-600 dark:bg-red-500/70 dark:text-red-300';
              break;
            default:
              className = '';
          }
          return ['span', { class: className }, 0];
        },
      } as MarkSpec,
    }),
  });

  function computeDiff(oldDoc: ProsemirrorNode, newDoc: ProsemirrorNode) {
    return diffEditor(diffSchema, oldDoc.toJSON(), newDoc.toJSON());
  }

  interface Props {
    oldContent: string;
    newContent: string;
  }

  let { oldContent, newContent }: Props = $props();

  let editorRef = $state<HTMLDivElement>();
  let viewRef = $state<EditorView | null>(null);

  $effect(() => {
    if (editorRef && !viewRef && oldContent && newContent) {
      const parser = DOMParser.fromSchema(diffSchema);

      // Create temporary containers for markdown parsing
      const oldContainer = document.createElement('div');
      oldContainer.innerHTML = `<div>${oldContent}</div>`;

      const newContainer = document.createElement('div');
      newContainer.innerHTML = `<div>${newContent}</div>`;

      const oldDoc = parser.parse(oldContainer);
      const newDoc = parser.parse(newContainer);

      const diffedDoc = computeDiff(oldDoc, newDoc);

      const state = EditorState.create({
        doc: diffedDoc,
        plugins: [],
      });

      viewRef = new EditorView(editorRef, {
        state,
        editable: () => false,
      });
    }

    return () => {
      if (viewRef) {
        viewRef.destroy();
        viewRef = null;
      }
    };
  });
</script>

<div class="diff-editor" bind:this={editorRef}></div>
