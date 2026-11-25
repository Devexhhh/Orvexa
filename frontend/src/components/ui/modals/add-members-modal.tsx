"use client";

import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { getUsers, UserSummary } from "@/services/user.service";
import { addRoomMember } from "@/services/room.service";
import { useRoomStore } from "@/store/room.store";
import { usePresenceStore } from "@/store/presence.store";
import { Conversation } from "@/types/conversation";

interface AddMembersModalProps {
    room: Conversation;
    onClose: () => void;
}

export default function AddMembersModal({
    room,
    onClose,
}: AddMembersModalProps) {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const addMemberToStore = useRoomStore((state) => state.addRoomMember);
    const onlineUsers = usePresenceStore((state) => state.onlineUsers);

    useEffect(() => {
        getUsers()
            .then(setUsers)
            .catch(() => setError("Could not load users"))
            .finally(() => setLoading(false));
    }, []);

    const memberIds = useMemo(
        () => new Set(room.members.map((member) => member.id)),
        [room.members],
    );

    const candidates = users.filter(
        (user) =>
            !memberIds.has(user.id) &&
            user.username.toLowerCase().includes(query.trim().toLowerCase()),
    );

    async function handleAdd(user: UserSummary) {
        setAddingId(user.id);
        setError(null);

        try {
            const data = await addRoomMember(room.id, user.id);
            addMemberToStore(room.id, data.member);
        } catch (err) {
            setError(
                isAxiosError(err)
                    ? err.response?.data?.message || "Failed to add member"
                    : "Failed to add member",
            );
        } finally {
            setAddingId(null);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-1 text-xl font-semibold">Add members</div>
                <div className="mb-4 text-sm text-gray-500">to {room.name}</div>

                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search people..."
                    className="mb-3 w-full rounded-lg border p-2"
                    autoFocus
                />

                {error && (
                    <div className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="max-h-72 space-y-1 overflow-y-auto">
                    {loading && (
                        <div className="py-6 text-center text-sm text-gray-500">
                            Loading...
                        </div>
                    )}

                    {!loading && candidates.length === 0 && (
                        <div className="py-6 text-center text-sm text-gray-500">
                            {users.length > 0 && query === ""
                                ? "Everyone is already in this room"
                                : "No people found"}
                        </div>
                    )}

                    {candidates.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2 w-2 rounded-full ${onlineUsers.includes(user.id)
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                        }`}
                                />
                                <span>{user.username}</span>
                            </div>

                            <button
                                onClick={() => handleAdd(user)}
                                disabled={addingId !== null}
                                className="rounded-lg bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
                            >
                                {addingId === user.id ? "Adding..." : "Add"}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="rounded-lg border px-4 py-2">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
