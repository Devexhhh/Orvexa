import { CustomWebSocket } from "../types/ws.types";
import { SocketEvent } from "../types/event.types";

export function sendSocketEvent(
    ws: CustomWebSocket,
    event: SocketEvent,
    data: any,
) {
    ws.send(
        JSON.stringify({
            event,
            data,
        }),
    );
}
