import { CustomWebSocket }
    from "../types/ws.types";

import { roomManager }
    from "../managers/roomManager";

export async function handleJoinRoom(
    ws: CustomWebSocket,
    data: any
) {

    const { roomId } = data;
    console.log(
        "JOIN ROOM",
        roomId,
        ws.userId,
    );
    roomManager.joinRoom(
        roomId,
        ws
    );

    roomManager.broadcastToRoom(
        roomId,
        {
            event: "USER_JOINED",
            data: {
                roomId
            }
        }
    );

}