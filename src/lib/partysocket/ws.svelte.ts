import { AttachWebSocketEventHandlers } from './handlers.svelte';
import {
    getOptionsThatShouldCauseRestartWhenChanged,
    StableSocket
} from './socket.svelte';
import WebSocket from './ws';
import type {
    Options,
    ProtocolsProvider,
    UrlProvider,
    WebSocketEventMap,
    ErrorEvent,
    CloseEvent,
    Message
} from './ws';

export type EventHandlerOptions = {
    onOpen?: (event: WebSocketEventMap['open']) => void;
    onClose?: (event: WebSocketEventMap['close']) => void;
    onMessage?: (event: WebSocketEventMap['message']) => void;
    onError?: (event: WebSocketEventMap['error']) => void;
};

type PartySocketOptions = Options & EventHandlerOptions;

/**
 * A Svelte 5 class that provides a stable, reconnecting WebSocket connection.
 */
class WebSocketConnection {
    #stableSocket: StableSocket<WebSocket, PartySocketOptions>;

    /**
     * The reactive WebSocket instance. It will be `null` until the connection is initiated.
     */
    get socket() {
        return this.#stableSocket.socket;
    }

    constructor(
        url: UrlProvider,
        protocols?: ProtocolsProvider,
        options: PartySocketOptions = {}
    ) {
        this.#stableSocket = new StableSocket(
            options,
            (opts) => new WebSocket(url, protocols, opts),
            (opts) =>
                JSON.stringify([
                    url,
                    protocols,
                    ...getOptionsThatShouldCauseRestartWhenChanged(opts)
                ])
        );

        new AttachWebSocketEventHandlers(this.#stableSocket.socket as WebSocket, options);
    }

    /**
     * Enqueues data to be sent over the WebSocket connection.
     */
    send(data: Message) {
        this.socket?.send(data);
    }

    /**
     * Closes the WebSocket connection.
     */
    close(code?: number, reason?: string) {
        this.socket?.close(code, reason);
    }

    /**
     * Reconnects the WebSocket.
     */
    reconnect(code?: number, reason?: string) {
        this.socket?.reconnect(code, reason);
    }
}

export {
    WebSocketConnection as WebSocket
}