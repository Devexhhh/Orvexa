"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const setToken =
        useAuthStore(

            (state) =>
                state.setToken

        );
    const {
        setUser,

        setLoading,
    } = useAuthStore();

    useEffect(() => {
        async function loadUser() {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }
            setToken(token);
            try {
                const data = await getCurrentUser();
                setUser(data.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    return children;
}
