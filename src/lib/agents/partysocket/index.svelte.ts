import PartySocket from './index';
import { WebSocketEventHandlers, type EventHandlerOptions } from './handlers.svelte';
import { getOptionsThatShouldCauseRestartWhenChanged, StableSocket } from './socket.svelte';

import type { PartySocketOptions } from './index';

type PartySocketConnectionOptions = Omit<PartySocketOptions, 'host'> &
	EventHandlerOptions & {
		host?: string | undefined;
	};

/**
 * A Svelte 5 class that wraps PartySocket with reactive state management.
 * Automatically handles reconnection when options change and cleanup on destroy.
 */
export class PartySocketConnection {
	#stableSocket: StableSocket<PartySocket, PartySocketOptions>;
	#handlers: WebSocketEventHandlers;

	constructor(options: PartySocketConnectionOptions) {
		const { host, ...otherOptions } = options;

		const socketOptions: PartySocketOptions = {
			host: host || (typeof window !== 'undefined' ? window.location.host : 'dummy-domain.com'),
			...otherOptions
		};

		this.#stableSocket = new StableSocket({
			options: socketOptions,
			createSocket: (opts) => new PartySocket(opts),
			createSocketMemoKey: (opts) =>
				JSON.stringify([
					// NOTE: if query is defined as a function, the socket
					// won't reconnect when you change the function identity
					opts.query,
					opts.id,
					opts.host,
					opts.room,
					opts.party,
					opts.path,
					opts.protocol,
					opts.protocols,
					opts.basePath,
					opts.prefix,
					...getOptionsThatShouldCauseRestartWhenChanged(opts)
				])
		});

		this.#handlers = new WebSocketEventHandlers(this.#stableSocket.socket, options);
	}

	get socket(): PartySocket {
		return this.#stableSocket.socket;
	}

	/** Update event handlers */
	updateHandlers(options: EventHandlerOptions) {
		this.#handlers.updateHandlers(options);
	}
}

export { WebSocketConnection } from './ws.svelte';

// Re-export types
export type { EventHandlerOptions } from './handlers.svelte';
