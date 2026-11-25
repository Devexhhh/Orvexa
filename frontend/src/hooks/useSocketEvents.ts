"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket/socketClient";
import { SocketEvent } from "@/types/socket";
import { useMessageStore } from "@/store/message.store";
import { useTypingStore } from "@/store/typing.store";
import { usePresenceStore } from "@/store/presence.store";
import { useRoomStore } from "@/store/room.store";
import { useSocketStore } from "@/store/socket.store";
import { useAuthStore } from "@/store/auth.store";
import { getConversations } from "@/services/room.service";

//
// Listeners read from stores with getState() so they always see
// the latest active room / user, instead of the values captured
// when the socket connected.
//
export default function useSocketEvents() {
    const connected = useSocketStore((state) => state.connected);
    const hasConnectedBefore = useRef(false);

    useEffect(() => {
        if (!connected) {
            return;
        }

        const socket = getSocket();
        if (!socket) {
            return;
        }

        //
        // Reconnect: catch up on anything missed while offline
        //
        if (hasConnectedBefore.current) {
            getConversations()
                .then((data) => useRoomStore.getState().setRooms(data.conversations || []))
                .catch(console.error);
        }
        hasConnectedBefore.current = true;

        socket.onmessage = (event) => {
            // Wire payloads are untyped JSON from the server
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let payload: { event: SocketEvent; data: any };

            try {
                payload = JSON.parse(event.data);
            } catch {
                return;
            }

            const { data } = payload;
            const rooms = useRoomStore.getState();
            const messages = useMessageStore.getState();
            const typing = useTypingStore.getState();
            const presence = usePresenceStore.getState();
            const currentUserId = useAuthStore.getState().user?.id;

            switch (payload.event) {
                case SocketEvent.MESSAGE_RECEIVED: {
                    const isOwn = data.senderId === currentUserId;

                    if (!isOwn && rooms.activeRoom?.id !== data.roomId) {
                        rooms.incrementUnread(data.roomId);
                    }

                    messages.replaceOptimisticMessage(data.roomId, {
                        ...data,
                        status: "sent",
                    });

                    rooms.updateRoomLastMessage(data.roomId, {
                        content: data.content,
                        createdAt: data.createdAt,
                    });

                    typing.removeTypingUser(data.roomId, data.senderId);
                    break;
                }

                case SocketEvent.ROOM_ADDED:
                    rooms.upsertRoom(data);
                    break;

                case SocketEvent.ROOM_MEMBER_ADDED:
                    rooms.addRoomMember(data.roomId, data.member);
                    break;

                case SocketEvent.USER_TYPING:
                    if (data.userId !== currentUserId) {
                        typing.addTypingUser(data.roomId, data.userId);
                    }
                    break;

                case SocketEvent.USER_STOPPED_TYPING:
                    typing.removeTypingUser(data.roomId, data.userId);
                    break;

                case SocketEvent.ONLINE_USERS:
                    presence.setOnlineUsers(data.userIds || []);
                    break;

                case SocketEvent.USER_ONLINE:
                    presence.addOnlineUser(data.userId);
                    break;

                case SocketEvent.USER_OFFLINE:
                    presence.removeOnlineUser(data.userId);

                    if (data.lastSeen) {
                        rooms.setMemberLastSeen(data.userId, data.lastSeen);
                    }
                    break;

                case SocketEvent.ROOM_MESSAGE_SEEN:
                    //
                    // Someone else read the room: my messages are seen
                    //
                    if (data.userId !== currentUserId) {
                        messages.markRoomMessagesSeen(data.roomId);
                    }
                    break;

                case SocketEvent.MESSAGE_SEEN:
                    if (data.userId !== currentUserId) {
                        messages.markMessageSeen(data.roomId, data.messageId);
                    }
                    break;

                case SocketEvent.MESSAGE_EDITED:
                    messages.editMessage(data.roomId, data.messageId, data.content);
                    break;

                case SocketEvent.ERROR:
                case SocketEvent.RATE_LIMIT_EXCEEDED:
                    console.warn("Socket error:", data?.message);
                    break;
            }
        };
    }, [connected]);
}
