import { SocketEvent } from "../types/event.types";
import { EventHandler } from "../types/handler.types";
import { handleSendMessage } from "../handlers/message.handler";
import { handleJoinRoom } from "../handlers/room.handler";
import { handleLeaveRoom } from "../handlers/leaveRoom.handler";
import {
    handleStartTyping,
    handleStopTyping,
} from "../handlers/typing.handler";
import { handleMarkAsRead } from "../handlers/read.handler";
import { handleEditMessage } from "../handlers/edit.handler";
import { handleDeleteMessage } from "../handlers/delete.handler";
import { messageSeenHandler } from "../handlers/messageSeen.handler";


export const eventHandlers: Partial<Record<SocketEvent, EventHandler>> = {
    [SocketEvent.SEND_MESSAGE]: handleSendMessage,
    [SocketEvent.JOIN_ROOM]: handleJoinRoom,
    [SocketEvent.LEAVE_ROOM]: handleLeaveRoom,
    [SocketEvent.START_TYPING]: handleStartTyping,
    [SocketEvent.STOP_TYPING]: handleStopTyping,
    [SocketEvent.MARK_AS_READ]: handleMarkAsRead,
    [SocketEvent.EDIT_MESSAGE]: handleEditMessage,
    [SocketEvent.DELETE_MESSAGE]: handleDeleteMessage,
    [SocketEvent.MESSAGE_SEEN]: messageSeenHandler,
};
