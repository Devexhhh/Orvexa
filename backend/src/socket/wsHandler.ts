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
import { getUserRoomIdsService } from "@modules/rooms/room.service";
import { sendSocketEvent } from "./utils/send";
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
        roomManager.registerUserSocket(ws);

        //
        // Register presence, then send the snapshot of who is
        // online (all instances) and announce this user
        //
        presenceManager
            .addUser(userId)
            .then(() => presenceManager.getOnlineUsers())
            .then(async (userIds) => {
                if (ws.readyState === ws.OPEN) {
                    sendSocketEvent(ws, SocketEvent.ONLINE_USERS, { userIds });
                }

                await broadcastPresence(SocketEvent.USER_ONLINE, userId);
            })
            .catch((error) => {
                console.error("PRESENCE CONNECT ERROR:", error);
            });

        //
        // Subscribe to every room the user belongs to,
        // so sidebar updates and unread counts arrive
        // for rooms that are not open
        //
        getUserRoomIdsService(userId)
            .then((roomIds) => {
                if (ws.readyState !== ws.OPEN) {
                    return;
                }

                roomIds.forEach((roomId) => roomManager.joinRoom(roomId, ws));
            })
            .catch((error) => {
                console.error("ROOM SUBSCRIBE ERROR:", error);
            });

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
            ws.removeAllListeners();

            try {
                await presenceManager.removeUser(userId);

                //
                // Other tabs/devices still connected (any instance)
                //
                if (await presenceManager.isOnline(userId)) {
                    return;
                }

                const lastSeen = new Date();

                await updateLastSeenService(userId, lastSeen);

                //
                // User may have reconnected while we were saving
                //
                if (!(await presenceManager.isOnline(userId))) {
                    await broadcastPresence(SocketEvent.USER_OFFLINE, userId, {
                        lastSeen,
                    });
                }
            } catch (error) {
                console.error("PRESENCE DISCONNECT ERROR:", error);
            }

            console.log("Client disconnected");
        });
    });

    //
    // Heartbeat
    //
    startHeartbeat(wss);
}
