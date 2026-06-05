import { SocketPayload } from "@/types/socket";

let socket: WebSocket | null = null;

let reconnectTimeout: NodeJS.Timeout;

export function connectSocket(token: string) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        return socket;
    }

    if (!token) {
        console.error("Missing socket token");

        return null;
    }

    socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`);
    socket.onopen = () => {
        console.log("Socket connected");
    };

    socket.onclose = (event) => {
        console.log("Socket disconnected", event.code, event.reason);

        //
        // Avoid reconnecting
        // unauthorized sockets
        //
        if (event.code === 1008) {
            console.log("Unauthorized socket");

            return;
        }

        reconnectTimeout = setTimeout(() => {
            connectSocket(token);
        }, 2000);
    };

    socket.onerror = (error) => {
        console.error("Socket error", error);
    };

    return socket;
}

export function disconnectSocket() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }

    socket?.close();

    socket = null;
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
