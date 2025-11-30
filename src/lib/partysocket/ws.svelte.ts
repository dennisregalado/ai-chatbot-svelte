import { WebSocketEventHandlers, type EventHandlerOptions } from './handlers.svelte';
import { getOptionsThatShouldCauseRestartWhenChanged, StableSocket } from './socket.svelte';
import WebSocket from 'partysocket/ws';

import type { Options, ProtocolsProvider, UrlProvider } from 'partysocket/ws';

type UseWebSocketOptions = Options & EventHandlerOptions;

/**
 * A Svelte 5 class that wraps PartySocket/WebSocket with reactive state management.
 * Automatically handles reconnection when options change and cleanup on destroy.
 */
export class WebSocketConnection {
	#stableSocket: StableSocket<WebSocket, Options>;
	#handlers: WebSocketEventHandlers;

	constructor(
		url: UrlProvider,
		protocols?: ProtocolsProvider,
		options: UseWebSocketOptions = {}
	) {
		this.#stableSocket = new StableSocket({
			options,
			createSocket: (opts) => new WebSocket(url, protocols, opts),
			createSocketMemoKey: (opts) =>
				JSON.stringify([
					// will reconnect if url or protocols are specified as a string.
					// if they are functions, the WebSocket will handle reconnection
					url,
					protocols,
					...getOptionsThatShouldCauseRestartWhenChanged(opts)
				])
		});

		this.#handlers = new WebSocketEventHandlers(this.#stableSocket.socket, options);
	}

	get socket(): WebSocket {
		return this.#stableSocket.socket;
	}

	/** Update event handlers */
	updateHandlers(options: EventHandlerOptions) {
		this.#handlers.updateHandlers(options);
	}
}

