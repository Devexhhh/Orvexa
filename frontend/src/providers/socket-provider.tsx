"use client";

import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "@/lib/socket/socketClient";
import { useAuthStore } from "@/store/auth.store";

export default function SocketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (!token) {
            return;
        }

        connectSocket(token);

        return () => {
            disconnectSocket();
        };
    }, [token]);

    return children;
}
