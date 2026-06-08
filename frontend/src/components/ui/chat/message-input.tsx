"use client";

import { useEffect, useState } from "react";

import { useRoomStore } from "@/store/room.store";

import { sendSocketEvent } from "@/lib/socket/socketClient";

import { SocketEvent } from "@/types/socket";

import { useMessageStore } from "@/store/message.store";

import { useAuthStore } from "@/store/auth.store";

import EmojiPicker from "emoji-picker-react";
import { Smile } from "lucide-react";
import { Paperclip } from "lucide-react";

import { uploadFile } from "@/services/upload.service";

export default function MessageInput() {
    const [message, setMessage] = useState("");

    const [isTyping, setIsTyping] = useState(false);

    const activeRoom = useRoomStore((state) => state.activeRoom);
    const roomId =
        activeRoom?.roomId ||
        activeRoom?.id;

    const addMessage = useMessageStore((state) => state.addMessage);

    const user = useAuthStore((state) => state.user);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!roomId) {
            return;
        }

        //
        // Empty input
        //
        if (!message.trim()) {
            if (isTyping) {
                setIsTyping(false);
                sendSocketEvent({
                    event: SocketEvent.STOP_TYPING,

                    data: {
                        roomId,
                    },
                });
            }

            return;
        }

        //
        // Start typing
        //
        if (!isTyping) {
            setIsTyping(true);

            sendSocketEvent({
                event: SocketEvent.START_TYPING,
                data: {
                    roomId,
                },
            });
        }

        //
        // Stop typing after inactivity
        //
        const timeout = setTimeout(() => {
            setIsTyping(false);
            sendSocketEvent({
                event: SocketEvent.STOP_TYPING,

                data: {
                    roomId,
                },
            });
        }, 1000);

        return () => clearTimeout(timeout);
    }, [message, roomId]);

    function handleEmojiSelect(emojiData: any) {
        setMessage((prev) => prev + emojiData.emoji);
    }

    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file || !roomId || !user) {
            return;
        }

        try {
            setUploading(true);

            const data = await uploadFile(file);
            addMessage(roomId, {
                id: crypto.randomUUID(),
                roomId: roomId,
                senderId: user.id,
                content: file.name,
                createdAt: new Date().toISOString(),
                optimistic: true,
                status: "sending",
                type: file.type.startsWith("image/") ? "IMAGE" : "FILE",
                fileUrl: data.fileUrl,
                fileName: file.name,
                fileSize: file.size,
                sender: {
                    username: user.username,
                    avatar: user.avatar,
                },
            });

            sendSocketEvent({
                event: SocketEvent.SEND_MESSAGE,

                data: {
                    roomId: roomId,
                    type: file.type.startsWith("image/") ? "IMAGE" : "FILE",
                    content: file.name,

                    fileUrl: data.fileUrl,

                    fileName: file.name,

                    fileSize: file.size,
                },
            });
        } catch (error) {
            console.error(error);
        } finally {
            setUploading(false);
        }
    }

    function sendMessage() {
        console.log("SEND MESSAGE CLICKED");
        console.log({
            message,
            roomId,
            user,
        });
        if (!message.trim() || !roomId || !user) {
            return;
        }
        addMessage(
            roomId,

            {
                id: crypto.randomUUID(),
                roomId: roomId,
                senderId: user.id,
                content: message,
                createdAt: new Date().toISOString(),
                optimistic: true,
                status: "sending",
                sender: {
                    username: user.username,
                    avatar: user.avatar,
                },
            },
        );

        sendSocketEvent({
            event: SocketEvent.SEND_MESSAGE,
            data: {
                roomId: roomId,
                type: "TEXT",
                content: message,
            },
        });

        setMessage("");
        setIsTyping(false);

        sendSocketEvent({
            event: SocketEvent.STOP_TYPING,

            data: {
                roomId: roomId,
            },
        });
    }

    return (
        <div className="border-t p-4">
            <div className="relative flex gap-2">
                <button
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="rounded-lg border p-3"
                >
                    <Smile size={20} />
                </button>

                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 rounded-lg border p-3"
                    placeholder="Type message..."
                />

                <label className="cursor-pointer rounded-lg border p-3">
                    <Paperclip size={20} />

                    <input type="file" hidden onChange={handleFileUpload} />
                </label>

                <button
                    onClick={sendMessage}
                    className="rounded-lg bg-black px-6 text-white"
                >
                    Send
                </button>

                {showEmojiPicker && (
                    <div className="absolute bottom-16 left-0 z-50">
                        <EmojiPicker onEmojiClick={handleEmojiSelect} />
                    </div>
                )}
            </div>

            {uploading && (
                <div className="mt-2 text-xs text-gray-500">Uploading...</div>
            )}
        </div>
    );
}
