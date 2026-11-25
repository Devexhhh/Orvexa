import { SocketEvent } from "../types/event.types";
import { emitToUser } from "../utils/userEmitter";

export function sendNotificationToUser(
    userId: string,
    notification: any,
) {
    return emitToUser(userId, SocketEvent.NEW_NOTIFICATION, notification);
}
