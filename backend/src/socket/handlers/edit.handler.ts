import { CustomWebSocket } from "../types/ws.types";
import { SocketEvent } from "../types/event.types";
import { broadcastMessage } from "../utils/broadcast";
import { editMessageService } from "@modules/messages/message.service";
import { EditMessageDTO } from "@modules/messages/edit.types";

export async function handleEditMessage(
    ws: CustomWebSocket,
    data: EditMessageDTO,
) {
    await editMessageService(data.messageId, ws.userId!, data.content);

    const payload = {
        roomId: data.roomId,
        messageId: data.messageId,
        content: data.content,
        editedAt: new Date(),
    };
    console.log("MESSAGE_EDITED BROADCASTED", payload);
    await broadcastMessage(data.roomId, SocketEvent.MESSAGE_EDITED, payload);
}
