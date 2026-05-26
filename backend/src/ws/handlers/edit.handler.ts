import { CustomWebSocket } from "../types/ws.types";
import { SocketEvent } from "../types/event.types";
import { broadcastMessage } from "../utils/broadcast";
import { editMessageService } from "@modules/messages/message.service";
import { EditMessageDTO } from "@modules/messages/edit.types";

export async function handleEditMessage(
    ws: CustomWebSocket,
    data: EditMessageDTO,
) {
    await editMessageService(
        data.messageId,
        ws.userId!,
        data.content,
    );

    broadcastMessage(
        data.roomId,
        SocketEvent.MESSAGE_EDITED,
        {
            messageId: data.messageId,
            content: data.content,
            editedAt: new Date(),
        },
    );
}
