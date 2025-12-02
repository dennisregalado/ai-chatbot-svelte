import type WebSocket from 'partysocket/ws';

export type EventHandlerOptions = {
	onOpen?: (event: WebSocketEventMap['open']) => void;
	onMessage?: (event: WebSocketEventMap['message']) => void;
	onClose?: (event: WebSocketEventMap['close']) => void;
	onError?: (event: WebSocketEventMap['error']) => void;
};

/**
 * Attaches event handlers to a WebSocket in a Svelte 5 lifecycle-friendly way.
 * Uses $effect for automatic cleanup when the socket changes or component unmounts.
 */
export class WebSocketEventHandlers {
	#socket: WebSocket;
	#options: EventHandlerOptions;

	constructor(socket: WebSocket, options: EventHandlerOptions = {}) {
		this.#socket = socket;
		this.#options = options;

		$effect(() => {
			const currentOptions = this.#options;
			const currentSocket = this.#socket;

			const onOpen: EventHandlerOptions['onOpen'] = (event) => currentOptions?.onOpen?.(event);
			const onMessage: EventHandlerOptions['onMessage'] = (event) =>
				currentOptions?.onMessage?.(event);
			const onClose: EventHandlerOptions['onClose'] = (event) => currentOptions?.onClose?.(event);
			const onError: EventHandlerOptions['onError'] = (event) => currentOptions?.onError?.(event);

			currentSocket.addEventListener('open', onOpen);
			currentSocket.addEventListener('close', onClose);
			currentSocket.addEventListener('error', onError);
			currentSocket.addEventListener('message', onMessage);

			return () => {
				currentSocket.removeEventListener('open', onOpen);
				currentSocket.removeEventListener('close', onClose);
				currentSocket.removeEventListener('error', onError);
				currentSocket.removeEventListener('message', onMessage);
			};
		});
	}

	/** Update the event handlers */
	updateHandlers(options: EventHandlerOptions) {
		this.#options = options;
	}
}
