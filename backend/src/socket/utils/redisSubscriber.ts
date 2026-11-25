import { redisSubscriber } from "@config/redis";
import { roomManager } from "../managers/roomManager";
import { SERVER_ID } from "@shared/constants/server";
import { USER_EVENTS_CHANNEL, deliverToLocalUser } from "./userEmitter";

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

    await redisSubscriber.subscribe(
        USER_EVENTS_CHANNEL,

        (message: string) => {
            const payload = JSON.parse(message);

            if (payload.serverId === SERVER_ID) {
                return;
            }

            deliverToLocalUser(payload);
        },
    );
}
