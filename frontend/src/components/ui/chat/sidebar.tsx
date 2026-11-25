"use client";

import { useRoomStore } from "@/store/room.store";
import { useSocketStore } from "@/store/socket.store";
import { useModalStore } from "@/store/modal.store";
import { useAuthStore } from "@/store/auth.store";
import { usePresenceStore } from "@/store/presence.store";
import NewChatModal from "../modals/new-chat-modal";

export default function Sidebar() {
    const { rooms, activeRoom, setActiveRoom } = useRoomStore();
    const connected = useSocketStore((state) => state.connected);
    const setCreateRoomOpen = useModalStore((state) => state.setCreateRoomOpen);
    const currentUserId = useAuthStore((state) => state.user?.id);
    const onlineUsers = usePresenceStore((state) => state.onlineUsers);

    return (
        <div className="w-80 border-r">
            <div className="border-b p-4 text-xl font-bold">Orvexa</div>
            <div className="px-4 pb-2 text-sm">
                {connected ? "🟢 Connected" : "🔴 Disconnected"}
            </div>
            <button
                onClick={() => setCreateRoomOpen(true)}
                className="rounded-lg bg-black px-4 py-2 text-white"
            >
                New Room
            </button>
            <input
                placeholder="Search rooms..."
                className="w-full rounded-lg border p-2"
            />
            <div className="flex flex-col gap-2">
                {rooms.length === 0 && (
                    <div className="py-10 text-center text-sm text-gray-500">
                        No conversations yet
                    </div>
                )}
                <NewChatModal />
                {rooms.map((room) => {
                    const roomId = room.id;
                    const active = activeRoom?.id === roomId;
                    const otherMember = room.isDirect
                        ? room.members.find((member) => member.id !== currentUserId)
                        : undefined;
                    const otherOnline = !!otherMember && onlineUsers.includes(otherMember.id);
                    return (
                        <button
                            key={roomId}
                            onClick={() => setActiveRoom(room)}
                            className={`rounded-xl p-3 text-left transition ${active ? "bg-black text-white" : "hover:bg-gray-100"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold">
                                    {otherMember && (
                                        <span
                                            className={`h-2 w-2 rounded-full ${otherOnline ? "bg-green-500" : "bg-gray-300"
                                                }`}
                                        />
                                    )}
                                    {room.name}
                                    {room.isGroup && (
                                        <span className={`text-xs font-normal ${active ? "text-gray-300" : "text-gray-400"}`}>
                                            {room.members.length}
                                        </span>
                                    )}
                                </div>
                                {room.unreadCount ? (
                                    <div className="rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                                        {room.unreadCount}
                                    </div>
                                ) : null}
                            </div>

                            <div
                                className={`mt-1 truncate text-sm ${active ? "text-gray-300" : "text-gray-500"
                                    }`}
                            >
                                {room.lastMessage?.content || "No messages yet"}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
