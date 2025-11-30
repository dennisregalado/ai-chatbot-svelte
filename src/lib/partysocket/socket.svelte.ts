import type WebSocket from 'partysocket/ws';
import type { Options } from 'partysocket/ws';

/** When any of the option values are changed, we should reinitialize the socket */
export const getOptionsThatShouldCauseRestartWhenChanged = (options: Options) => [
	options.startClosed,
	options.minUptime,
	options.maxRetries,
	options.connectionTimeout,
	options.maxEnqueuedMessages,
	options.maxReconnectionDelay,
	options.minReconnectionDelay,
	options.reconnectionDelayGrowFactor,
	options.debug
];

export interface StableSocketParams<T extends WebSocket, TOpts extends Options> {
	options: TOpts;
	createSocket: (options: TOpts) => T;
	createSocketMemoKey: (options: TOpts) => string;
}

/**
 * Initializes a PartySocket (or WebSocket) and keeps it stable across reactive updates,
 * but reconnects and updates the reference when any of the connection args change.
 */
export class StableSocket<T extends WebSocket, TOpts extends Options> {
	#socket = $state<T>() as T;
	#options: TOpts;
	#createSocket: (options: TOpts) => T;
	#createSocketMemoKey: (options: TOpts) => string;
	#socketInitialized: T | null = null;
	#previousMemoKey: string | null = null;

	constructor({ options, createSocket, createSocketMemoKey }: StableSocketParams<T, TOpts>) {
		this.#options = options;
		this.#createSocket = createSocket;
		this.#createSocketMemoKey = createSocketMemoKey;

		// Create initial socket in closed state
		this.#socket = createSocket({ ...options, startClosed: true } as TOpts);

		$effect(() => {
			const currentMemoKey = this.#createSocketMemoKey(this.#options);

			// Check if we need to reconnect due to options change
			if (this.#socketInitialized === this.#socket && this.#previousMemoKey !== currentMemoKey) {
				// Create new socket - options have changed
				const newSocket = this.#createSocket({
					...this.#options,
					// when reconnecting because of options change, we always reconnect
					// (startClosed only applies to initial mount)
					startClosed: false
				} as TOpts);

				// Close the old socket
				this.#socket.close();

				// Update socket reference
				this.#socket = newSocket;
				this.#socketInitialized = newSocket;
				this.#previousMemoKey = currentMemoKey;
			} else if (!this.#socketInitialized) {
				// First time initialization
				if (this.#options.startClosed !== true) {
					this.#socket.reconnect();
				}
				this.#socketInitialized = this.#socket;
				this.#previousMemoKey = currentMemoKey;
			}

			// Cleanup on destroy
			return () => {
				this.#socket.close();
			};
		});
	}

	get socket(): T {
		return this.#socket;
	}

	/** Update options - will trigger reconnect if relevant options changed */
	updateOptions(options: TOpts) {
		this.#options = options;
	}
}
