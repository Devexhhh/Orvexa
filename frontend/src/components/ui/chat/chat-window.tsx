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

export default function ChatWindow() {
    const user = useAuthStore((state) => state.user);
    const activeRoom = useRoomStore((state) => state.activeRoom);
    const setMessages = useMessageStore((state) => state.setMessages);
    const roomMessages = useMessageStore((state) => state.messages);
    const messages = activeRoom ? roomMessages[activeRoom.id] || [] : [];
    const bottomRef = useRef<HTMLDivElement>(null);
    const typingState = useTypingStore((state) => state.typingUsers);
    const clearUnread = useRoomStore((state) => state.clearUnread);
    const typingUsers = activeRoom ? typingState[activeRoom.id] || [] : [];
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


    useEffect(() => {
        if (!activeRoom) {
            return;
        }

        sendSocketEvent({
            event: SocketEvent.ROOM_MESSAGE_SEEN,
            data: {
                roomId: activeRoom.id,
            },
        });
    }, [activeRoom]);

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
    }, [activeRoom, setMessages]);

    useEffect(() => {
        if (!activeRoom) {
            return;
        }

        sendSocketEvent({
            event: SocketEvent.JOIN_ROOM,
            data: {
                roomId: activeRoom.id,
            },
        });

        return () => {
            sendSocketEvent({
                event: SocketEvent.LEAVE_ROOM,
                data: {
                    roomId: activeRoom.id,
                },
            });
        };
    }, [activeRoom]);

    useEffect(() => {
        if (!activeRoom) {
            return;
        }
        const unseenMessages = messages.filter(
            (message) =>
                message.senderId !== user?.id &&
                message.status !== "seen" &&
                !message.optimistic,
        );
        unseenMessages.forEach((message) => {
            if (
                message.senderId !== user?.id &&
                message.status !== "seen" &&
                !message.optimistic
            ) {
                sendSocketEvent({
                    event: SocketEvent.MESSAGE_SEEN,
                    data: {
                        roomId: activeRoom.id,
                        messageId: message.id,
                    },
                });
            }
        });
    }, [messages, activeRoom]);

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
            <div className="border-b p-4 text-lg font-semibold">
                {activeRoom.name}
            </div>

            <div ref={containerRef} className="flex-1 overflow-y-auto">
                <MessageList />
            </div>
            {typingUsers.length > 0 && (
                <div className="px-4 pb-2 text-sm text-gray-500">
                    {typingUsers.join(", ")}
                    typing...
                </div>
            )}

            <MessageInput />

            <div ref={bottomRef} />
        </div>
    );
}
