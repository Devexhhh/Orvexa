import http from "http";
import app from "./app";
import * as WS from "ws";
import { attachWebSocketHandlers } from "./socket/wsHandler";
import { authenticateSocket } from "./socket/middleware/authSocket";
import { connectRedis } from "@config/redis";
import { subscribeToRoomEvents } from "socket/utils/redisSubscriber";

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
    server.listen(
        Number(PORT),
        "0.0.0.0",
        () => {
            console.log(`Server running on ${PORT}`);
        },
    );
}

bootstrap();
