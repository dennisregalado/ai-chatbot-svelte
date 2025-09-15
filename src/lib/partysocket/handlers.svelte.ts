import type WebSocket from "./ws";
import type { WebSocketEventMap } from "./ws";

export type EventHandlerOptions = {
    onOpen?: (event: WebSocketEventMap["open"]) => void;
    onMessage?: (event: WebSocketEventMap["message"]) => void;
    onClose?: (event: WebSocketEventMap["close"]) => void;
    onError?: (event: WebSocketEventMap["error"]) => void;
};

/** Attaches event handlers to a WebSocket in a React Lifecycle-friendly way */
export class AttachWebSocketEventHandlers {
    socket: WebSocket;
    options: EventHandlerOptions;

    constructor(
        socket: WebSocket,
        options: EventHandlerOptions
    ) {
        this.socket = socket;
        this.options = options;
    }

    let handlersRef = $state(this.options);
    handlersRef = this.options;

    $effect(() => {
        const onOpen: EventHandlerOptions["onOpen"] = (event) =>
            handlersRef?.onOpen?.(event);
        const onMessage: EventHandlerOptions["onMessage"] = (event) =>
            handlersRef?.onMessage?.(event);
        const onClose: EventHandlerOptions["onClose"] = (event) =>
            handlersRef?.onClose?.(event);
        const onError: EventHandlerOptions["onError"] = (event) =>
            handlersRef?.onError?.(event);

        socket.onopen = onOpen;
        socket.onclose = onClose;
        socket.onerror = onError;
        socket.onmessage = onMessage;

        return () => {
            socket.onopen = null;
            socket.onclose = null;
            socket.onerror = null;
            socket.onmessage = null;
        };
    });
};
}