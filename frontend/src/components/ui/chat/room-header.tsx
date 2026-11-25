"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { usePresenceStore } from "@/store/presence.store";
import { Conversation } from "@/types/conversation";
import { formatLastSeen } from "@/lib/utils/date";
import AddMembersModal from "../modals/add-members-modal";

export default function RoomHeader({ room }: { room: Conversation }) {
    const currentUserId = useAuthStore((state) => state.user?.id);
    const onlineUsers = usePresenceStore((state) => state.onlineUsers);
    const [membersOpen, setMembersOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);

    const isOnline = (userId: string) => onlineUsers.includes(userId);

    const otherMember = room.isDirect
        ? room.members.find((member) => member.id !== currentUserId)
        : undefined;

    const onlineCount = room.members.filter((member) => isOnline(member.id)).length;

    let subtitle: string;

    if (otherMember) {
        subtitle = isOnline(otherMember.id)
            ? "Online"
            : formatLastSeen(otherMember.lastSeen);
    } else {
        subtitle = `${room.members.length} member${room.members.length === 1 ? "" : "s"} · ${onlineCount} online`;
    }

    return (
        <div className="relative border-b p-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-lg font-semibold">{room.name}</div>
                    <div className="text-sm text-gray-500">{subtitle}</div>
                </div>

                {room.isGroup && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMembersOpen((open) => !open)}
                            className="rounded-lg border px-3 py-1 text-sm"
                        >
                            Members
                        </button>
                        <button
                            onClick={() => setAddOpen(true)}
                            className="rounded-lg bg-black px-3 py-1 text-sm text-white"
                        >
                            Add members
                        </button>
                    </div>
                )}
            </div>

            {membersOpen && room.isGroup && (
                <div className="absolute right-4 top-full z-40 mt-2 w-72 rounded-xl border bg-white p-2 shadow-lg">
                    {room.members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg p-2"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2 w-2 rounded-full ${isOnline(member.id) ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                />
                                <span>
                                    {member.username}
                                    {member.id === currentUserId && (
                                        <span className="text-gray-400"> (you)</span>
                                    )}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">
                                {isOnline(member.id) ? "Online" : formatLastSeen(member.lastSeen)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {addOpen && (
                <AddMembersModal room={room} onClose={() => setAddOpen(false)} />
            )}
        </div>
    );
}
