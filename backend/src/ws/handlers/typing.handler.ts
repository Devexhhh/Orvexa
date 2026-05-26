import { CustomWebSocket } from "../types/ws.types";
import { TypingPayload } from "../types/typing.types";
import { SocketEvent } from "../types/event.types";
import { broadcastMessage } from "../utils/broadcast";

export async function handleStartTyping(
    ws: CustomWebSocket,
    data: TypingPayload,
) {
    broadcastMessage(
        data.roomId,
        SocketEvent.USER_TYPING,
        {
            roomId: data.roomId,
            userId: ws.userId,
        },
    );
}

export async function handleStopTyping(
    ws: CustomWebSocket,
    data: TypingPayload,
) {
    broadcastMessage(
        data.roomId,
        SocketEvent.USER_STOPPED_TYPING,

        {
            roomId: data.roomId,
            userId: ws.userId,
        },
    );
}
