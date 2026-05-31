export enum SocketEvent {
    //
    // Room
    //
    JOIN_ROOM = "JOIN_ROOM",
    LEAVE_ROOM = "LEAVE_ROOM",
    USER_JOINED = "USER_JOINED",
    USER_LEFT = "USER_LEFT",

    //
    // Messages
    //
    SEND_MESSAGE = "SEND_MESSAGE",
    MESSAGE_RECEIVED = "MESSAGE_RECEIVED",
    MESSAGE_DELIVERED = "MESSAGE_DELIVERED",
    MESSAGE_READ = "MESSAGE_READ",
    MARK_AS_READ = "MARK_AS_READ",
    EDIT_MESSAGE = "EDIT_MESSAGE",
    DELETE_MESSAGE = "DELETE_MESSAGE",
    MESSAGE_EDITED = "MESSAGE_EDITED",
    MESSAGE_DELETED = "MESSAGE_DELETED",
    MESSAGE_SEEN = "MESSAGE_SEEN",
    //
    // Typing
    //
    START_TYPING = "START_TYPING",
    STOP_TYPING = "STOP_TYPING",
    USER_TYPING = "USER_TYPING",
    USER_STOPPED_TYPING = "USER_STOPPED_TYPING",

    //
    // Connection
    //
    PING = "PING",
    PONG = "PONG",
    ERROR = "ERROR",
    //
    // Presence
    //
    USER_ONLINE = "USER_ONLINE",
    USER_OFFLINE = "USER_OFFLINE",

    //
    // Notifications
    //
    NEW_NOTIFICATION = "NEW_NOTIFICATION",

    //
    // Connection
    //
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

export interface SocketMessage<T = any> {
    event: SocketEvent;
    data: T;
}
