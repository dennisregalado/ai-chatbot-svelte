import { getContext, setContext } from 'svelte';

export type CodeBlockContextType = {
	code: string;
};

const CODE_BLOCK_CONTEXT_KEY = Symbol('code-block');

export function setCodeBlockContext(context: CodeBlockContextType) {
	return setContext<CodeBlockContextType>(CODE_BLOCK_CONTEXT_KEY, context);
}

export function getCodeBlockContext(): CodeBlockContextType {
	const context = getContext<CodeBlockContextType>(CODE_BLOCK_CONTEXT_KEY);
	if (!context) {
		throw new Error(
			'CodeBlock context not found. Make sure you are using CodeBlockCopyButton inside a CodeBlock component.'
		);
	}
	return context;
}
