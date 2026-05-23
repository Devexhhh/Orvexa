import { WebSocketServer } from "ws";
import { CustomWebSocket } from "./types/ws.types";
import { parseSocketMessage } from "./utils/parser";
import { eventHandlers } from "./events";
import { roomManager } from "./managers/roomManager";

export function attachWebSocketHandlers(wss: WebSocketServer) {
    wss.on("connection", (ws: CustomWebSocket) => {
        console.log("Client connected");

        ws.isAlive = true;

        ws.on("pong", () => {
            ws.isAlive = true;
        });

        ws.on("message", async (message) => {
            const parsedMessage = parseSocketMessage(message.toString());

            if (!parsedMessage) {
                return;
            }
            const handler = eventHandlers[parsedMessage.event];
            if (!handler) {
                console.log(`Unknown event: ${parsedMessage.event}`);

                return;
            }
            try {
                await handler(ws, parsedMessage.data);
            } catch (error) {
                console.error("Socket handler error:", error);
            }
        });

        ws.on("close", () => {
            roomManager.removeSocket(ws);
            console.log("Client disconnected");
        });
    });

    //
    // Heartbeat
    //
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
