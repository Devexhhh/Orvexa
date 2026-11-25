import { roomManager } from "../managers/roomManager";
import { presenceManager } from "../managers/presenceManager";
import { SocketEvent } from "../types/event.types";
import { publishSocketEvent } from "../utils/redisPublisher";

export const PRESENCE_EVENTS_CHANNEL = "presence-events";

export interface PresencePayload {
    event: SocketEvent;
    data: { userId: string } & Record<string, unknown>;
}

//
// Send to every socket connected to this instance
//
export function deliverPresenceLocally({ event, data }: PresencePayload) {
    if (event === SocketEvent.USER_ONLINE) {
        presenceManager.markOnline(data.userId);
    } else if (event === SocketEvent.USER_OFFLINE) {
        presenceManager.markOffline(data.userId);
    }

    roomManager.broadcastToAll({ event, data });
}

//
// Send to every connected socket, on every instance
//
export async function broadcastPresence(
    event: SocketEvent,
    userId: string,
    extra: Record<string, unknown> = {},
) {
    const payload: PresencePayload = {
        event,
        data: { userId, ...extra },
    };

    deliverPresenceLocally(payload);

    await publishSocketEvent(PRESENCE_EVENTS_CHANNEL, payload);
}
