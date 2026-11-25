import http from "http";
import app from "./app";
import * as WS from "ws";
import { attachWebSocketHandlers } from "./socket/wsHandler";
import { authenticateSocket } from "./socket/middleware/authSocket";
import { connectRedis } from "@config/redis";
import { subscribeToRoomEvents } from "socket/utils/redisSubscriber";
import { presenceManager } from "socket/managers/presenceManager";
import { deliverPresenceLocally } from "socket/handlers/presence.handler";
import { SocketEvent } from "socket/types/event.types";
import { updateLastSeenService } from "@modules/users/user.service";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WS.WebSocketServer({
    noServer: true,
});

attachWebSocketHandlers(wss);

server.on("upgrade", (req, socket, head) => {
    try {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        if (url.pathname === "/ws") {
            const authPayload = authenticateSocket(req);
            if (!authPayload) {
                socket.destroy();
                return;
            }
            wss.handleUpgrade(req, socket, head, (ws) => {
                const customSocket = ws as any;
                customSocket.userId = authPayload.userId;
                wss.emit("connection", customSocket, req);
            });
        } else {
            socket.destroy();
        }
    } catch (error) {
        socket.destroy();
    }
});

async function bootstrap() {
    await connectRedis();
    await subscribeToRoomEvents();
    //
    // Users whose instance crashed: every instance tells its own
    // clients (no Redis fan-out needed); one persists lastSeen
    //
    await presenceManager.start(async (userIds) => {
        const lastSeen = new Date();

        for (const userId of userIds) {
            deliverPresenceLocally({
                event: SocketEvent.USER_OFFLINE,
                data: { userId, lastSeen },
            });

            if (await presenceManager.claimOfflineWrite(userId)) {
                await updateLastSeenService(userId, lastSeen).catch(console.error);
            }
        }
    });
    server.listen(
        Number(PORT),
        "0.0.0.0",
        () => {
            console.log(`Server running on ${PORT}`);
        },
    );
}

//
// Drop this instance's presence right away instead of
// waiting for its Redis TTL to expire
//
async function shutdown() {
    try {
        await presenceManager.stop();
    } catch (error) {
        console.error(error);
    }

    process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

bootstrap();
