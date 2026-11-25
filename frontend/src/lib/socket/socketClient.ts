import { SocketPayload } from "@/types/socket";
import { useSocketStore } from "@/store/socket.store";

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;

//
// Set when we close on purpose (logout / unmount),
// so onclose does not schedule a reconnect
//
let manuallyClosed = false;

const MAX_RECONNECT_DELAY = 10000;

export function connectSocket(token: string) {
    if (
        socket &&
        (socket.readyState === WebSocket.OPEN ||
            socket.readyState === WebSocket.CONNECTING)
    ) {
        return socket;
    }

    if (!token) {
        console.error("Missing socket token");

        return null;
    }

    manuallyClosed = false;

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);
    socket = ws;

    ws.onopen = () => {
        reconnectAttempts = 0;
        useSocketStore.getState().setConnected(true);
    };

    ws.onclose = (event) => {
        //
        // A newer socket already replaced this one
        //
        if (socket !== ws) {
            return;
        }

        socket = null;
        useSocketStore.getState().setConnected(false);

        //
        // Avoid reconnecting closed-on-purpose
        // or unauthorized sockets
        //
        if (manuallyClosed || event.code === 1008) {
            return;
        }

        const delay = Math.min(1000 * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY);
        reconnectAttempts += 1;

        reconnectTimeout = setTimeout(() => {
            connectSocket(token);
        }, delay);
    };

    ws.onerror = (error) => {
        console.error("Socket error", error);
    };

    return ws;
}

export function disconnectSocket() {
    manuallyClosed = true;

    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }

    const current = socket;
    socket = null;
    current?.close();

    useSocketStore.getState().setConnected(false);
}

export function getSocket() {
    return socket;
}

export function sendSocketEvent<T>(payload: SocketPayload<T>) {
    if (!payload?.event) {
        console.error("Invalid socket payload");
        return;
    }
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
    }
}
