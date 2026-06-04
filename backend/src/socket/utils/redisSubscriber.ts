import { redisSubscriber } from "@config/redis";
import { roomManager } from "../managers/roomManager";
import { SERVER_ID } from "@shared/constants/server";

export async function subscribeToRoomEvents() {
    await redisSubscriber.subscribe(
        "room-events",

        (message: string) => {
            const payload = JSON.parse(message);

            //
            // Ignore events
            // from same server
            //
            if (payload.serverId === SERVER_ID) {
                return;
            }

            roomManager.broadcastToRoom(
                payload.roomId,
                {
                    event: payload.event,
                    data: payload.data,
                },
            );
        },
    );
}
