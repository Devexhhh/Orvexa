"use client";

import { useEffect, useRef, useState } from "react";
import { useRoomStore } from "@/store/room.store";
import { useMessageStore } from "@/store/message.store";
import { getMessages } from "@/services/message.service";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import { useTypingStore } from "@/store/typing.store";
import { sendSocketEvent } from "@/lib/socket/socketClient";

import { SocketEvent } from "@/types/socket";
import { useAuthStore } from "@/store/auth.store";
import RoomHeader from "./room-header";

export default function ChatWindow() {
    const user = useAuthStore((state) => state.user);
    const activeRoom = useRoomStore((state) => state.activeRoom);
    const setMessages = useMessageStore((state) => state.setMessages);
    const roomMessages = useMessageStore((state) => state.messages);
    const messages = activeRoom ? roomMessages[activeRoom.id] || [] : [];
    const bottomRef = useRef<HTMLDivElement>(null);
    const typingState = useTypingStore((state) => state.typingUsers);
    const clearUnread = useRoomStore((state) => state.clearUnread);
    const typingUserIds = activeRoom ? typingState[activeRoom.id] || [] : [];
    const typingUsers = typingUserIds.map(
        (userId) =>
            activeRoom?.members.find((member) => member.id === userId)?.username ||
            "Someone",
    );
    const prependMessages = useMessageStore((state) => state.prependMessages);
    const [loadingMore, setLoadingMore] = useState(false);
    const oldestMessage = messages[0];
    const containerRef = useRef<HTMLDivElement>(null);
    const hasMore = useMessageStore((state) =>
        activeRoom ? (state.hasMore[activeRoom.id] ?? true) : true,
    );

    const setHasMore = useMessageStore((state) => state.setHasMore);

    async function loadMore() {
        if (!activeRoom || !oldestMessage || loadingMore) {
            return;
        }
        if (!hasMore) {
            return;
        }
        setLoadingMore(true);
        try {
            const response = await getMessages(activeRoom.id, oldestMessage.id);
            prependMessages(activeRoom.id, [...response.messages].reverse());
            if (response.messages.length < 20) {
                setHasMore(activeRoom.id, false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMore(false);
        }
    }

    const previousCount = useRef(0);
    const lastSeenSentFor = useRef<string | null>(null);



    useEffect(() => {
        if (messages.length > previousCount.current && !loadingMore) {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
            });
        }

        previousCount.current = messages.length;
    }, [messages, loadingMore]);

    useEffect(() => {
        if (!activeRoom) {
            return;
        }
        clearUnread(activeRoom.id);
        async function loadMessages() {
            try {
                const data = await getMessages(activeRoom!.id);
                setHasMore(activeRoom!.id, true);
                setMessages(activeRoom!.id, [...data.messages].reverse());
            } catch (error) {
                console.error(error);
            }
        }
        loadMessages();
    }, [activeRoom?.id, setMessages]);

    useEffect(() => {
        if (!activeRoom) {
            return;
        }

        //
        // The server subscribes us to all our rooms on connect;
        // this is an idempotent re-subscribe. We do not LEAVE_ROOM
        // on switch, otherwise sidebar updates for this room stop.
        //
        sendSocketEvent({
            event: SocketEvent.JOIN_ROOM,
            data: {
                roomId: activeRoom.id,
            },
        });
    }, [activeRoom?.id]);

    useEffect(() => {
        if (!activeRoom) {
            return;
        }

        //
        // One event marks the whole room as read, sent when the room
        // opens and whenever someone else's message arrives in it.
        //
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage || lastMessage.optimistic || lastMessage.senderId === user?.id) {
            return;
        }

        if (lastSeenSentFor.current === lastMessage.id) {
            return;
        }

        lastSeenSentFor.current = lastMessage.id;

        sendSocketEvent({
            event: SocketEvent.ROOM_MESSAGE_SEEN,
            data: {
                roomId: activeRoom.id,
            },
        });

        clearUnread(activeRoom.id);
    }, [messages, activeRoom?.id, user?.id]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        function handleScroll() {
            if (container!.scrollTop < 100) {
                loadMore();
            }
        }
        container.addEventListener("scroll", handleScroll);

        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, [activeRoom]);

    if (!activeRoom) {
        return (
            <div className="flex flex-1 items-center justify-center">
                Select a room
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <RoomHeader room={activeRoom} />

            <div ref={containerRef} className="flex-1 overflow-y-auto">
                <MessageList />
            </div>
            {typingUsers.length > 0 && (
                <div className="px-4 pb-2 text-sm text-gray-500">
                    {typingUsers.join(", ")}{" "}
                    {typingUsers.length === 1 ? "is" : "are"} typing...
                </div>
            )}

            <MessageInput />

            <div ref={bottomRef} />
        </div>
    );
}
