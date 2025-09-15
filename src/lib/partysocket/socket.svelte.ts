import { onMount } from 'svelte';
import type WebSocket from './ws.ts';
import type { Options } from './ws.ts';

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

/**
 * Initializes a WebSocket and keeps it stable across component lifecycles,
 * reconnecting and updating the reference when connection arguments change.
 * This is a Svelte 5 class-based implementation of the original React hook.
 */
export class StableSocket<T extends WebSocket, TOpts extends Options> {
	// Public properties from constructor
	options: TOpts;
	createSocket: (options: TOpts) => T;
	createSocketMemoKey: (options: TOpts) => string;

	// Public reactive state, equivalent to useState
	socket: T | null = $state(null);

	// Internal state, equivalent to useRef
	#socketInitialized: T | null = null;
	#isMounted = false;

	// Derived state, equivalent to useMemo
	#shouldReconnect: string;

	constructor(
		options: TOpts,
		createSocket: (options: TOpts) => T,
		createSocketMemoKey: (options: TOpts) => string
	) {
		this.options = options;
		this.createSocket = createSocket;
		this.createSocketMemoKey = createSocketMemoKey;

		this.#shouldReconnect = $derived(this.createSocketMemoKey(this.options));

		onMount(() => {
			this.#isMounted = true;
			return () => {
				this.#isMounted = false;
			};
		});

		$effect(() => {
			if (!this.#isMounted) {
				// On unmount, the last effect's cleanup function will handle closing the socket.
				return;
			}

			// Read the reactive dependencies for this effect run
			this.#shouldReconnect; // Establish reactivity to the memoization key
			const currentSocket = this.socket;

			if (currentSocket === null) {
				// Initial socket creation, equivalent to the useState initializer function.
				this.socket = this.createSocket({ ...this.options, startClosed: true });
				// The effect will re-run once the socket state is updated.
				return;
			}

			// This logic block is a direct translation of the original useEffect hook.
			if (this.#socketInitialized === currentSocket) {
				// If the socket instance is the same, it means the options have changed.
				// We create a new socket and update the state, which triggers the effect again.
				const newSocket = this.createSocket({
					...this.options,
					startClosed: false
				});
				this.socket = newSocket;
			} else {
				// A new socket instance has been set.
				// This runs for the initial socket and any replacement sockets.
				if (!this.#socketInitialized && this.options.startClosed !== true) {
					currentSocket.reconnect();
				}

				// Mark the new socket as the initialized one.
				this.#socketInitialized = currentSocket;

				// The cleanup function for this effect will close this socket instance
				// if it gets replaced or when the component unmounts.
				return () => {
					currentSocket.close();
				};
			}
		});
	}
}