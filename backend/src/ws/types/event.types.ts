export enum SocketEvent {

    //
    // Room events
    //
    JOIN_ROOM = "JOIN_ROOM",

    LEAVE_ROOM = "LEAVE_ROOM",

    //
    // Message events
    //
    SEND_MESSAGE = "SEND_MESSAGE",

    MESSAGE_RECEIVED =
    "MESSAGE_RECEIVED",

    //
    // Typing events
    //
    START_TYPING = "START_TYPING",

    STOP_TYPING = "STOP_TYPING",

    //
    // Presence events
    //
    USER_JOINED = "USER_JOINED",

    USER_LEFT = "USER_LEFT",

    //
    // Connection
    //
    PING = "PING",

    PONG = "PONG"
}

export interface SocketMessage<T = any> {

    event: SocketEvent;

    data: T;

}