import { SocketMessage } from "../types/event.types";

export function parseSocketMessage(rawMessage: string): SocketMessage | null {
    try {
        return JSON.parse(rawMessage);
    } catch (error) {
        return null;
    }
}
