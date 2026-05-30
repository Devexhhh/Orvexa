import { markMessageAsReadService } from "@modules/messages/message.service";
import { CustomWebSocket } from "../types/ws.types";
import { broadcastMessage } from "@socket/utils/broadcast";
import { SocketEvent } from "@socket/types/event.types";

export async function messageSeenHandler(
    ws: CustomWebSocket,
    data: {
        messageId: string;
        roomId: string;
    },
) {
    await markMessageAsReadService(data.messageId, ws.userId!);
    await broadcastMessage(data.roomId, SocketEvent.MESSAGE_SEEN, {
        roomId: data.roomId,
        messageId: data.messageId,
        userId: ws.userId,
    });
}
