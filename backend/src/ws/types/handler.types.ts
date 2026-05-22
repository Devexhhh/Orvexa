import { CustomWebSocket } from "./ws.types";

export type EventHandler = (
    ws: CustomWebSocket,
    data: any
) => Promise<void>;