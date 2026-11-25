import { CustomWebSocket } from "../types/ws.types";
import { SocketEvent } from "../types/event.types";
import { broadcastMessage } from "../utils/broadcast";
import { deleteMessageService } from "@modules/messages/message.service";
import { DeleteMessageDTO } from "@modules/messages/edit.types";
import { requireRoomSubscription } from "../middleware/requireRoom";

export async function handleDeleteMessage(
    ws: CustomWebSocket,
    data: DeleteMessageDTO,
) {
    if (!requireRoomSubscription(ws, data?.roomId)) {
        return;
    }

    await deleteMessageService(data.messageId, ws.userId!);
    await broadcastMessage(data.roomId, SocketEvent.MESSAGE_DELETED, {
        messageId: data.messageId,
        deletedAt: new Date(),
    });
}
