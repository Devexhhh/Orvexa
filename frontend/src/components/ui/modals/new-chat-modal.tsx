"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/services/user.service";
import { createDirectRoom } from "@/services/room.service";

interface User {
    id: string;
    username: string;
    avatar?: string;
}

export default function NewChatModal() {
    const [users, setUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        async function loadUsers() {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (error) {
                console.error(error);
            }
        }

        loadUsers();
    }, [open]);

    async function handleStartChat(userId: string) {
        try {
            await createDirectRoom(userId);

            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="rounded bg-blue-500 px-3 py-2 text-white"
            >
                New Chat
            </button>

            {open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                    <div className="w-96 rounded bg-white p-4">
                        <h2 className="mb-4 text-lg font-semibold">Start Chat</h2>

                        <div className="space-y-2">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleStartChat(user.id)}
                                    className="block w-full rounded border p-2 text-left hover:bg-gray-100"
                                >
                                    {user.username}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setOpen(false)}
                            className="mt-4 text-sm text-gray-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
