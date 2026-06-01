import { roomManager } from "../managers/roomManager";
import { SocketEvent } from "../types/event.types";
import { publishSocketEvent } from "./redisPublisher";

export async function broadcastMessage(
    roomId: string,
    event: SocketEvent,
    data: any,
) {
    const payload = {
        event,
        data,
        roomId,
    };

    //
    // Local broadcast
    //
    roomManager.broadcastToRoom(
        roomId,
        payload,
    );

    //
    // Distributed broadcast
    //
    await publishSocketEvent(
        "room-events",
        payload,
    );
}
