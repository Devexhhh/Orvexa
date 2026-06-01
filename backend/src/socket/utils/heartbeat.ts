import { WebSocketServer } from "ws";

import { CustomWebSocket } from "../types/ws.types";

export function startHeartbeat(wss: WebSocketServer) {
    setInterval(() => {
        wss.clients.forEach((ws: CustomWebSocket) => {
            if (!ws.isAlive) {
                console.log("Terminating dead socket");

                return ws.terminate();
            }

            ws.isAlive = false;

            ws.ping();
        });
    }, 30000);
}
