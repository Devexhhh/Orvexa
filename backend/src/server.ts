import http from "http";
import app from "./app";
import { WebSocketServer } from "ws";
import { attachWebSocketHandlers } from "./ws/wsHandler";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const wss = new WebSocketServer({
    noServer: true
});

attachWebSocketHandlers(wss);

server.on("upgrade", (req, socket, head) => {
    try {
        const url = new URL(
            req.url!,
            `http://${req.headers.host}`
        );
        if (url.pathname === "/ws") {
            wss.handleUpgrade(req, socket, head, (ws) => {

                wss.emit("connection", ws, req);

            });

        } else {
            socket.destroy();
        }
    } catch (error) {
        socket.destroy();
    }
});

server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(
        `🚀 Orvexa backend running on port ${PORT}`
    );

});