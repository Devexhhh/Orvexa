import { CustomWebSocket } from "../types/ws.types";
import { SocketEvent } from "../types/event.types";
import { broadcastMessage } from "../utils/broadcast";
import { markMessageAsReadService } from "@modules/messages/message.service";
import { MarkAsReadDTO } from "@modules/messages/read.types";

export async function handleMarkAsRead(
    ws: CustomWebSocket,
    data: MarkAsReadDTO,
) {
    await markMessageAsReadService(
        data.messageId,
        ws.userId!,
    );

    broadcastMessage(
        data.roomId,

        SocketEvent.MESSAGE_READ,
        {
            messageId: data.messageId,
            userId: ws.userId!,
        },
    );
}
