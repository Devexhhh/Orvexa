import { CustomWebSocket } from "../types/ws.types";
import { roomManager } from "../managers/roomManager";
import { isRoomMemberService } from "@modules/rooms/room.service";
import { sendSocketError } from "@shared/utils/socketError";

//
// Sockets are subscribed to all of the user's rooms on connect.
// JOIN_ROOM is kept as an explicit (idempotent) re-subscribe,
// and only succeeds for members.
//
export async function handleJoinRoom(
    ws: CustomWebSocket,
    data: any,
) {
    const roomId = data?.roomId;

    if (typeof roomId !== "string" || !roomId) {
        return;
    }

    if (roomManager.isInRoom(roomId, ws)) {
        return;
    }

    if (!(await isRoomMemberService(roomId, ws.userId!))) {
        sendSocketError(ws, "You are not a member of this room");
        return;
    }

    roomManager.joinRoom(roomId, ws);
}
