"use client";

import { useEffect } from "react";
import { connectSocket } from "@/lib/socket/socketClient";
import { useAuthStore } from "@/store/auth.store";
import { useSocketStore } from "@/store/socket.store";

export default function SocketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = useAuthStore((state) => state.token);

    const setConnected = useSocketStore((state) => state.setConnected);

    useEffect(() => {
        if (!token) {
            return;
        }

        const socket = connectSocket(token);

        socket!.onopen = () => {
            setConnected(true);
        };

        socket!.onclose = () => {
            setConnected(false);
        };

        return () => {
            socket!.close();
        };
    }, [token]);

    return children;
}
