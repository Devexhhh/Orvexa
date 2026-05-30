import { WebSocketServer } from "ws";
import { CustomWebSocket } from "./types/ws.types";
import { parseSocketMessage } from "./utils/parser";
import { eventHandlers } from "./events";
import { roomManager } from "./managers/roomManager";
import { presenceManager } from "./managers/presenceManager";
import { broadcastPresence } from "./handlers/presence.handler";
import { SocketEvent } from "./types/event.types";
import { startHeartbeat } from "./utils/heartbeat";
import { updateLastSeenService } from "@modules/users/user.service";
import { checkRateLimit } from "./middleware/rateLimiter";
import { sendSocketError } from "@shared/utils/socketError";

export function attachWebSocketHandlers(wss: WebSocketServer) {
    wss.on("connection", (ws: CustomWebSocket) => {
        console.log("Client connected");

        if (!ws.userId) {
            console.log("Unauthorized socket");
            ws.close(1008, "Unauthorized");

            return;
        }
        const userId = ws.userId;
        ws.isAlive = true;
        presenceManager.addUser(ws.userId);

        broadcastPresence(
            wss,

            SocketEvent.USER_ONLINE,

            ws.userId,
        );

        ws.on("error", (error) => {
            console.error("WS CONNECTION ERROR:", error);
        });

        ws.on("pong", () => {
            ws.isAlive = true;
        });

        ws.on("message", async (message) => {
            try {
                const parsedMessage = parseSocketMessage(message.toString());

                //
                // Rate limit
                //
                if (!checkRateLimit(userId)) {
                    ws.send(
                        JSON.stringify({
                            event: SocketEvent.RATE_LIMIT_EXCEEDED,

                            data: {
                                message: "Too many requests",
                            },
                        }),
                    );

                    return;
                }

                if (!parsedMessage) {
                    console.log("Invalid socket payload");

                    return;
                }

                const handler = eventHandlers[parsedMessage.event];

                if (!handler) {
                    console.log(`Unknown event: ${parsedMessage.event}`);

                    return;
                }

                await handler(ws, parsedMessage.data);
            } catch (error) {
                console.error("SOCKET MESSAGE ERROR:", error);

                sendSocketError(
                    ws,
                    error instanceof Error ? error.message : "Socket error",
                );
            }
        });

        ws.on("close", async () => {
            roomManager.removeSocket(ws);
            presenceManager.removeUser(userId);
            try {
                await updateLastSeenService(userId);
            } catch (error) {
                console.error(error);
            }
            if (!presenceManager.isOnline(userId)) {
                broadcastPresence(wss, SocketEvent.USER_OFFLINE, userId);
            }
            ws.removeAllListeners();
            console.log("Client disconnected");
        });
    });

    //
    // Heartbeat
    //
    startHeartbeat(wss);
}
