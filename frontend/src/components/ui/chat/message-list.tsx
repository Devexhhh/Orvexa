"use client";

import { useRef, useState } from "react";
import { useRoomStore } from "@/store/room.store";
import { Message, useMessageStore } from "@/store/message.store";
import { useAuthStore } from "@/store/auth.store";
import { usePresenceStore } from "@/store/presence.store";
import { formatMessageDate } from "@/lib/utils/date";

import Image from "next/image";
import { sendSocketEvent } from "@/lib/socket/socketClient";
import { SocketEvent } from "@/types/socket";

export default function MessageList() {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeRoom = useRoomStore((state) => state.activeRoom);
    const roomMessages = useMessageStore((state) => state.messages);
    const hasMoreMap = useMessageStore((state) => state.hasMore);
    const messages = activeRoom ? roomMessages[activeRoom.id] || [] : [];
    const hasMore = activeRoom ? hasMoreMap[activeRoom.id] : false;
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

    const [editedText, setEditedText] = useState("");

    const user = useAuthStore((state) => state.user);

    const onlineUsers = usePresenceStore((state) => state.onlineUsers);

    function handleEdit(message: Message) {
        setEditingMessageId(message.id);
        setEditedText(message.content);
    }

    function saveEdit(message: Message) {
        console.log("EDITING");
        sendSocketEvent({
            event: SocketEvent.EDIT_MESSAGE,
            data: {
                roomId: message.roomId,
                messageId: message.id,
                content: editedText,
            },
        });

        setEditingMessageId(null);
    }

    async function handleScroll() {
        if (!containerRef.current || !hasMore) {
            return;
        }

        if (containerRef.current.scrollTop < 100) {
            console.log("Load older messages");

            // infinite scroll hook later
        }
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex flex-1 flex-col p-4"
        >
            {messages.map((message, index) => {
                const previous = messages[index - 1];
                const next = messages[index + 1];
                const isOwn = message.senderId === user?.id;
                const showAvatar = !next || next.senderId !== message.senderId;
                const showHeader = !previous || previous.senderId !== message.senderId;
                const showDateSeparator =
                    !previous ||
                    new Date(previous.createdAt).toDateString() !==
                    new Date(message.createdAt).toDateString();

                return (
                    <div key={message.id}>
                        {showDateSeparator && (
                            <div className="my-6 flex items-center gap-3">
                                <div className="h-px flex-1 bg-gray-200" />

                                <div className="text-xs text-gray-500">
                                    {formatMessageDate(message.createdAt)}
                                </div>

                                <div className="h-px flex-1 bg-gray-200" />
                            </div>
                        )}

                        <div
                            className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn ? "ml-auto bg-black text-white" : "bg-gray-100"
                                    } ${showHeader ? "mt-4" : "mt-1"}`}
                            >
                                {showHeader && (
                                    <div className="mb-1 flex items-center gap-2">
                                        <div className="font-semibold">
                                            {message.sender?.username}
                                        </div>

                                        {onlineUsers.includes(message.senderId) && (
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                        )}
                                    </div>
                                )}
                                {message.type === "image" ? (
                                    <Image
                                        src={message.sender?.avatar || "/default-avatar.png"}
                                        alt="avatar"
                                        width={32}
                                        height={32}
                                        className="mt-1 h-8 w-8 rounded-full object-cover"
                                    />
                                ) : message.type === "file" ? (
                                    <a
                                        href={message.fileUrl}
                                        target="_blank"
                                        className="mt-2 block rounded-lg border p-3 underline"
                                    >
                                        📎 {message.fileName}
                                    </a>
                                ) : editingMessageId === message.id ? (
                                    <>
                                        <input
                                            value={editedText}
                                            onChange={(e) => setEditedText(e.target.value)}
                                            className="w-full rounded border px-2 py-1 text-black"
                                        />

                                        <div className="mt-2 flex gap-2">
                                            <button
                                                onClick={() => saveEdit(message)}
                                                className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                                            >
                                                Save
                                            </button>

                                            <button
                                                onClick={() => setEditingMessageId(null)}
                                                className="rounded bg-gray-500 px-2 py-1 text-xs text-white"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        {message.content}
                                        {message.isEdited && (
                                            <span className="ml-1 text-xs text-gray-400">
                                                (edited)
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="mt-1 text-xs opacity-70">
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                                {message.senderId === user?.id && (
                                    <button
                                        onClick={() => handleEdit(message)}
                                        className="text-xs text-gray-500"
                                    >
                                        Edit
                                    </button>
                                )}
                                {message.senderId === user?.id && (
                                    <div className="mt-1 text-[10px] opacity-60">
                                        {message.status === "sending" && "Sending..."}
                                        {message.status === "sent" && "Sent"}
                                        {message.status === "seen" && "Seen"}
                                        {message.status === "failed" && "Failed"}
                                    </div>
                                )}
                            </div>

                            {showAvatar && !isOwn && (
                                <Image
                                    src={message.sender?.avatar || "/default-avatar.png"}
                                    alt="avatar"
                                    width={32}
                                    height={32}
                                    className="mt-1 h-8 w-8 rounded-full object-cover"
                                />
                            )}
                            <button className="mt-1 text-xs opacity-60 hover:opacity-100">
                                😀 Add Reaction
                            </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {message.reactions?.map((reaction) => (
                                <button
                                    key={reaction.emoji}
                                    className="rounded-full border px-2 py-1 text-xs"
                                >
                                    {reaction.emoji} {reaction.users.length}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
