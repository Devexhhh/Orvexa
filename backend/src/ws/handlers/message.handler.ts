import { CustomWebSocket }
    from "../types/ws.types";

import {
    ChatMessage,
    MessageType
}
    from "../types/message.types";

import { broadcastMessage }
    from "../utils/broadcast";

export async function handleSendMessage(
    ws: CustomWebSocket,
    data: ChatMessage
) {

    const messagePayload: ChatMessage = {

        roomId: data.roomId,

        senderId: ws.userId || "anonymous",

        type: data.type || MessageType.TEXT,

        content: data.content,

        fileUrl: data.fileUrl,

        fileName: data.fileName,

        fileSize: data.fileSize,

        createdAt: new Date()

    };

    //
    // Future:
    // Save to database here
    //

    broadcastMessage(
        data.roomId,
        "MESSAGE_RECEIVED",
        messagePayload
    );

}