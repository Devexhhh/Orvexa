import { WebSocket } from "ws";

export interface CustomWebSocket extends WebSocket {
    isAlive?: boolean;

    userId?: string;

    roomId?: string;
}