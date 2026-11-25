import { roomManager } from "../managers/roomManager";
import { SocketEvent } from "../types/event.types";
import { publishSocketEvent } from "./redisPublisher";

export const USER_EVENTS_CHANNEL = "user-events";

export interface UserEventOptions {
    //
    // Subscribe the user's sockets to this room
    // before delivering the event
    //
    subscribeRoomId?: string;
}

export interface UserEventPayload {
    userId: string;
    event: SocketEvent;
    data: unknown;
    options?: UserEventOptions;
}

//
// Deliver to sockets of `userId` connected to this process
//
export function deliverToLocalUser({
    userId,
    event,
    data,
    options,
}: UserEventPayload) {
    if (options?.subscribeRoomId) {
        roomManager.joinRoomForUser(options.subscribeRoomId, userId);
    }

    const message = JSON.stringify({ event, data });

    roomManager.getUserSockets(userId).forEach((socket) => {
        if (socket.readyState === socket.OPEN) {
            socket.send(message);
        }
    });
}

//
// Deliver to every socket of `userId`, on every backend instance
//
export async function emitToUser(
    userId: string,
    event: SocketEvent,
    data: unknown,
    options?: UserEventOptions,
) {
    const payload: UserEventPayload = { userId, event, data, options };

    deliverToLocalUser(payload);

    await publishSocketEvent(USER_EVENTS_CHANNEL, payload);
}
