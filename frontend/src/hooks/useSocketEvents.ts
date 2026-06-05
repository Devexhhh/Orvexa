"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket/socketClient";
import { SocketEvent } from "@/types/socket";
import { useMessageStore } from "@/store/message.store";
import { useTypingStore } from "@/store/typing.store";
import { usePresenceStore } from "@/store/presence.store";
import { useRoomStore } from "@/store/room.store";
import { useSocketStore } from "@/store/socket.store";

export default function useSocketEvents() {
    console.log("HOOK MOUNTED");

    const addMessage = useMessageStore((state) => state.addMessage);
    const setTypingUsers = useTypingStore((state) => state.setTypingUsers);
    const addOnlineUser = usePresenceStore((state) => state.addOnlineUser);
    const removeOnlineUser = usePresenceStore((state) => state.removeOnlineUser);
    const updateRoomLastMessage = useRoomStore(
        (state) => state.updateRoomLastMessage,
    );
    const incrementUnread = useRoomStore((state) => state.incrementUnread);
    const activeRoom = useRoomStore((state) => state.activeRoom);
    const replaceOptimisticMessage = useMessageStore(
        (state) => state.replaceOptimisticMessage,
    );
    const markRoomMessagesSeen = useMessageStore(
        (state) => state.markRoomMessagesSeen,
    );
    const markMessageSeen = useMessageStore((state) => state.markMessageSeen);
    const editMessage = useMessageStore((state) => state.editMessage);
    const connected = useSocketStore((state) => state.connected);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) {
            return;
        }

        console.log("ATTACHING LISTENER");

        socket.onmessage = (event) => {
            console.log("RAW_SOCKET_EVENT", event.data);
            const payload = JSON.parse(event.data);
            console.log("FULL PAYLOAD", payload);
            console.log("PARSED_EVENT", payload.event);

            switch (payload.event) {
                case SocketEvent.MESSAGE_RECEIVED:
                    if (activeRoom?.id !== payload.data.roomId) {
                        incrementUnread(payload.data.roomId);
                    }

                    replaceOptimisticMessage(payload.data.roomId, payload.data);

                    addMessage(payload.data.roomId, {
                        ...payload.data,
                        status: "sent",
                    });

                    updateRoomLastMessage(payload.data.roomId, {
                        content: payload.data.content,
                        createdAt: payload.data.createdAt,
                    });

                    break;

                case SocketEvent.START_TYPING:
                    setTypingUsers(
                        payload.data.roomId,
                        payload.data.users,
                    );

                    break;

                case SocketEvent.STOP_TYPING:
                    setTypingUsers(payload.data.roomId, payload.data.users);
                    break;
                case SocketEvent.USER_ONLINE:
                    addOnlineUser(payload.data.userId);

                    break;

                case SocketEvent.USER_OFFLINE:
                    removeOnlineUser(payload.data.userId);

                    break;

                case SocketEvent.ROOM_MESSAGE_SEEN:
                    markRoomMessagesSeen(payload.data.roomId);
                    break;

                case SocketEvent.MESSAGE_SEEN:
                    markMessageSeen(payload.data.roomId, payload.data.messageId);
                    break;

                case SocketEvent.MESSAGE_EDITED:
                    console.log("MESSAGE_EDITED RECEIVED", payload);

                    editMessage(
                        payload.data.roomId,
                        payload.data.messageId,
                        payload.data.content,
                    );
                    break;
            }
        };
    }, [connected]);
}
