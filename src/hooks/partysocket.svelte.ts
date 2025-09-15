import PartySocketLib from 'partysocket';
import { onMount } from 'svelte';

const PARTYKIT_HOST: string = `${typeof window !== 'undefined' ? window.location.origin : ''}/party`;

// Global socket cache to persist across hot reloads
const socketCache = new Map<string, PartySocketLib>();

export class PartySocket {
	#roomId: string;
	#finalRoomId!: string;
	#socket: PartySocketLib | null = null;
	#messageListeners = new Set<(data: unknown) => void>();

	// Reactive state
	isConnected = $state(false);

	constructor(roomId: string) {
		this.#roomId = roomId;
		this.#setupRoom();
		this.#setupSocket();
	}

	#setupRoom() {
		let room = this.#roomId;
		if (room.startsWith('/')) room = room.slice(1);
		if (room.endsWith('/')) room = room.slice(0, -1);
		this.#finalRoomId = room.split('/').join('-') || 'default';
	}

	#setupSocket() {
		onMount(() => {
			// Try to reuse existing socket for this room to survive hot reloads
			let socket = socketCache.get(this.#finalRoomId);

			if (!socket || socket.readyState === WebSocket.CLOSED) {
				// Create new socket if none exists or if closed
				socket = new PartySocketLib({
					host: PARTYKIT_HOST,
					party: 'grid-server',
					room: this.#finalRoomId,
					startClosed: true
				});
				socketCache.set(this.#finalRoomId, socket);
			}

			this.#socket = socket;

			// Update connection state based on current socket state
			this.isConnected = socket.readyState === WebSocket.OPEN;

			const handleOpen = () => {
				this.isConnected = true;
			};

			const handleClose = () => {
				this.isConnected = false;
			};

			const handleError = (error: Event) => {
				console.error('[Socket] Connection error:', error);
				this.isConnected = false;
			};

			// Handle incoming messages and distribute to all listeners
			const handleMessage = (event: MessageEvent) => {
				try {
					// PartySocket might provide parsed JSON directly, or as a string
					let data;
					if (typeof event.data === 'string') {
						data = JSON.parse(event.data);
					} else {
						data = event.data; // Already parsed
					}
					// Notify all message listeners
					this.#messageListeners.forEach((listener) => {
						try {
							listener(data);
						} catch (err) {
							console.error('[Socket] Error in message listener:', err);
						}
					});
				} catch (err) {
					console.error('[Socket] Failed to parse message:', err, event.data);
				}
			};

			// Remove any existing listeners to avoid duplicates
			socket.removeEventListener('open', handleOpen);
			socket.removeEventListener('close', handleClose);
			socket.removeEventListener('error', handleError);
			socket.removeEventListener('message', handleMessage);

			// Set up all event listeners
			socket.addEventListener('open', handleOpen);
			socket.addEventListener('close', handleClose);
			socket.addEventListener('error', handleError);
			socket.addEventListener('message', handleMessage);

			// Open connection if not already open
			if (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
				socket.reconnect();
			}

			// Return cleanup function for onMount
			return () => {
				// Don't close the socket on cleanup - let it persist for hot reloads
				// Just remove our specific listeners
				socket.removeEventListener('open', handleOpen);
				socket.removeEventListener('close', handleClose);
				socket.removeEventListener('error', handleError);
				socket.removeEventListener('message', handleMessage);
			};
		});
	}

	// Function to subscribe to messages
	subscribeToMessages(listener: (data: unknown) => void) {
		this.#messageListeners.add(listener);
		return () => {
			this.#messageListeners.delete(listener);
		};
	}

	// Expose the socket instance
	get socket(): PartySocketLib | null {
		return this.#socket;
	}

	// Additional utility methods for socket operations
	send(data: unknown) {
		if (this.#socket && this.#socket.readyState === WebSocket.OPEN) {
			this.#socket.send(JSON.stringify(data));
		}
	}

	close() {
		if (this.#socket) {
			this.#socket.close();
		}
	}

	reconnect() {
		if (this.#socket) {
			this.#socket.reconnect();
		}
	}
}
