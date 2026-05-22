import { WebSocket } from "ws";

export function sendEvent(
    ws: WebSocket,
    event: string,
    data: any
) {

    ws.send(
        JSON.stringify({
            event,
            data
        })
    );

}