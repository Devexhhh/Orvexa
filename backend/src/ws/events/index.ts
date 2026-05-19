import { SocketEvent }
    from "../types/event.types";

import { EventHandler }
    from "../types/handler.types";

import { handleSendMessage }
    from "../handlers/message.handler";

import { handleJoinRoom }
    from "../handlers/room.handler";

import { handleLeaveRoom }
    from "../handlers/leaveRoom.handler";

export const eventHandlers:
    Partial<Record<SocketEvent, EventHandler>> = {

    [SocketEvent.SEND_MESSAGE]:
        handleSendMessage,

    [SocketEvent.JOIN_ROOM]:
        handleJoinRoom,

    [SocketEvent.LEAVE_ROOM]:
        handleLeaveRoom

};