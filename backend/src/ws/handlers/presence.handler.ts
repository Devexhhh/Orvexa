import { WebSocketServer } from "ws";
import { SocketEvent } from "../types/event.types";

export function broadcastPresence(
    wss: WebSocketServer,
    event: SocketEvent,
    userId: string,
) {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(
                JSON.stringify({
                    event,
                    data: {
                        userId,
                    },
                }),
            );
        }
    });
}
