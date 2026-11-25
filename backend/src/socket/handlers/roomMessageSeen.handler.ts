import { markMessagesAsReadService } from "@modules/messages/message.service";
import { CustomWebSocket } from "../types/ws.types";
import { SocketEvent } from "../types/event.types";
import { broadcastMessage } from "../utils/broadcast";
import { requireRoomSubscription } from "../middleware/requireRoom";

//
// Mark every message in the room as read by this user
//
export async function handleRoomMessageSeen(
    ws: CustomWebSocket,
    data: { roomId?: string },
) {
    const roomId = data?.roomId;

    if (!requireRoomSubscription(ws, roomId)) {
        return;
    }

    const markedCount = await markMessagesAsReadService(roomId, ws.userId!);

    if (markedCount === 0) {
        return;
    }

    await broadcastMessage(roomId, SocketEvent.ROOM_MESSAGE_SEEN, {
        roomId,
        userId: ws.userId,
    });
}
