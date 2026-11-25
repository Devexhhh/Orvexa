import { CustomWebSocket } from "../types/ws.types";
import { SocketEvent } from "../types/event.types";
import { broadcastMessage } from "../utils/broadcast";
import { editMessageService } from "@modules/messages/message.service";
import { EditMessageDTO } from "@modules/messages/edit.types";
import { requireRoomSubscription } from "../middleware/requireRoom";

export async function handleEditMessage(
    ws: CustomWebSocket,
    data: EditMessageDTO,
) {
    if (!requireRoomSubscription(ws, data?.roomId)) {
        return;
    }

    await editMessageService(data.messageId, ws.userId!, data.content);

    const payload = {
        roomId: data.roomId,
        messageId: data.messageId,
        content: data.content,
        editedAt: new Date(),
    };
    await broadcastMessage(data.roomId, SocketEvent.MESSAGE_EDITED, payload);
}
