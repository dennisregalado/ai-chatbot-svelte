import { getContext, setContext } from 'svelte';

export type WebPreviewContextValue = {
  url: string;
  setUrl: (url: string) => void;
  consoleOpen: boolean;
  setConsoleOpen: (open: boolean) => void;
};

const WEB_PREVIEW_CONTEXT_KEY = Symbol('web-preview');

export function createWebPreviewContext(defaultUrl = '', onUrlChange?: (url: string) => void) {
  let url = $state(defaultUrl);
  let consoleOpen = $state(false);

  const setUrl = (newUrl: string) => {
    url = newUrl;
    onUrlChange?.(newUrl);
  };

  const setConsoleOpen = (open: boolean) => {
    consoleOpen = open;
  };

  const context = {
    get url() { return url; },
    setUrl,
    get consoleOpen() { return consoleOpen; },
    setConsoleOpen
  };

  setContext(WEB_PREVIEW_CONTEXT_KEY, context);
  return context;
}

export function useWebPreview(): WebPreviewContextValue {
  const context = getContext<WebPreviewContextValue>(WEB_PREVIEW_CONTEXT_KEY);
  if (!context) {
    throw new Error('WebPreview components must be used within a WebPreview');
  }
  return context;
}
