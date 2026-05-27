import { CustomWebSocket } from "socket/types/ws.types";
import { SocketEvent } from "socket/types/event.types";

export function sendSocketError(
    ws: CustomWebSocket,
    message: string,
) {
    ws.send(
        JSON.stringify({
            event: SocketEvent.ERROR,
            data: {
                message,
            },
        }),
    );
}
