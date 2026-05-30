import { roomManager } from "../managers/roomManager";
import { SocketEvent } from "../types/event.types";
import { sendSocketEvent } from "../utils/send";
import { CustomWebSocket } from "../types/ws.types";

export function sendNotificationToUser(
    userId: string,
    notification: any,
) {
    const sockets = roomManager.getUserSockets(userId);

    sockets.forEach((socket: CustomWebSocket) => {
        sendSocketEvent(
            socket,
            SocketEvent.NEW_NOTIFICATION,
            notification,
        );
    });
}
