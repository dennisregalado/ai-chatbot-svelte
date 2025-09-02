import CodeBlock from './code-block.svelte';
import CodeBlockCopyButton from './code-block-copy-button.svelte';
import {
	setCodeBlockContext,
	getCodeBlockContext,
	type CodeBlockContextType
} from './code-block-context.svelte.js';

export {
	CodeBlock,
	CodeBlockCopyButton,
	setCodeBlockContext,
	getCodeBlockContext,
	type CodeBlockContextType
};

export type { CodeBlockProps } from './code-block.svelte';
export type { CodeBlockCopyButtonProps } from './code-block-copy-button.svelte';
