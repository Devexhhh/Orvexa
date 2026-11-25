import { CustomWebSocket } from "../types/ws.types";
import { roomManager } from "../managers/roomManager";
import { sendSocketError } from "@shared/utils/socketError";

//
// Cheap authorization for high-frequency events:
// a socket is only ever subscribed to rooms its user is a member of.
//
export function requireRoomSubscription(
    ws: CustomWebSocket,
    roomId: unknown,
): roomId is string {
    if (typeof roomId !== "string" || !roomManager.isInRoom(roomId, ws)) {
        sendSocketError(ws, "You are not a member of this room");
        return false;
    }

    return true;
}
