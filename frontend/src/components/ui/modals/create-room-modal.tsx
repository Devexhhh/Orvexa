"use client";

import { useState } from "react";
import { createRoom } from "@/services/room.service";
import { useModalStore } from "@/store/modal.store";
import { useRoomStore } from "@/store/room.store";

export default function CreateRoomModal() {
    const [name, setName] = useState("");
    const createRoomOpen = useModalStore((state) => state.createRoomOpen);
    const setCreateRoomOpen = useModalStore((state) => state.setCreateRoomOpen);
    const rooms = useRoomStore((state) => state.rooms);
    const setRooms = useRoomStore((state) => state.setRooms);

    if (!createRoomOpen) {
        return null;
    }

    async function handleCreate() {
        if (!name.trim()) {
            return;
        }

        try {
            const data = await createRoom({
                name,
                isGroup: true,
            });

            setRooms([...rooms, data.room]);
            setCreateRoomOpen(false);
            setName("");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 text-xl font-semibold">Create Room</div>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Room name"
                    className="w-full rounded-lg border p-3"
                />

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={() => setCreateRoomOpen(false)}
                        className="rounded-lg border px-4 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleCreate}
                        className="rounded-lg bg-black px-4 py-2 text-white"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
