import { CustomWebSocket } from "../types/ws.types";
import { SocketEvent } from "../types/event.types";
import { broadcastMessage } from "../utils/broadcast";
import { deleteMessageService } from "@modules/messages/message.service";
import { DeleteMessageDTO } from "@modules/messages/edit.types";

export async function handleDeleteMessage(
    ws: CustomWebSocket,
    data: DeleteMessageDTO,
) {
    await deleteMessageService(data.messageId, ws.userId!);
    broadcastMessage(data.roomId, SocketEvent.MESSAGE_DELETED, {
        messageId: data.messageId,
        deletedAt: new Date(),
    });
}
