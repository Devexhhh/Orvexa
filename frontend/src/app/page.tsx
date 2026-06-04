"use client";

import { useEffect } from "react";
import ChatLayout from "@/components/ui/chat/chat-layout";
import { useRoomStore } from "@/store/room.store";
import { getConversations } from "@/services/room.service";

export default function HomePage() {
    const setRooms = useRoomStore((state) => state.setRooms);

    useEffect(() => {
        async function loadRooms() {
            try {
                const data = await getConversations();
                setRooms(data.conversations || []);
            } catch (error) {
                console.error(error);
            }
        }

        loadRooms();
    }, []);

    return <ChatLayout />;
}
