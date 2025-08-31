import { getContext, setContext } from 'svelte';
import type { CarouselAPI } from '$lib/components/ui/carousel/context';

const CAROUSEL_CONTEXT = Symbol('INLINE_CITATION_CAROUSEL');

export function setCarouselApi(api: CarouselAPI | undefined) {
	setContext(CAROUSEL_CONTEXT, api);
}

export function getCarouselApi(): CarouselAPI | undefined {
	return getContext(CAROUSEL_CONTEXT);
}
