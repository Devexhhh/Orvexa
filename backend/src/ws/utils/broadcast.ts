import { roomManager }
    from "../managers/roomManager";

export function broadcastMessage(
    roomId: string,
    event: string,
    data: any
) {

    roomManager.broadcastToRoom(
        roomId,
        {
            event,
            data
        }
    );

}