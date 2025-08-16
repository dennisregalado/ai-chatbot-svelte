import type { Snippet } from 'svelte';

export type WithElementRef<T, U extends HTMLElement | SVGElement = HTMLElement> = T & {
	ref?: U | null;
};

export type WithElementRefAndChild<
	T,
	U extends HTMLElement | SVGElement = HTMLElement
> = WithElementRef<T, U> & { child?: Snippet<[{ props: T }]> };

// Define custom UI data types for the AI data stream
export interface CustomUIDataTypes {
	// Add specific data types here as needed
	[key: string]: any;
}

// Define a data UI part type for the stream
export interface DataUIPart<T = CustomUIDataTypes> {
	type: string;
	data: T;
	id?: string;
	timestamp?: Date;
}
