import { CustomWebSocket }
    from "../types/ws.types";

import { roomManager }
    from "../managers/roomManager";

export async function handleLeaveRoom(
    ws: CustomWebSocket,
    data: any
) {

    const { roomId } = data;

    roomManager.leaveRoom(
        roomId,
        ws
    );

    roomManager.broadcastToRoom(
        roomId,
        {
            event: "USER_LEFT",
            data: {
                roomId
            }
        }
    );

}