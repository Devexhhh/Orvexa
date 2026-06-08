"use client";

import Sidebar from "./sidebar";
import ChatWindow from "./chat-window";
import useSocketEvents
    from "@/hooks/useSocketEvents";

export default function ChatLayout() {
    useSocketEvents();
    return (
        <div className="flex h-screen">
            <Sidebar />
            <ChatWindow />
        </div>
    );
}
