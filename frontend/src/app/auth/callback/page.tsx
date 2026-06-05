"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function AuthCallbackPage() {
    const router = useRouter();
    const params = useSearchParams();
    const { setToken, setUser } = useAuthStore();

    useEffect(() => {
        async function login() {
            const token = params.get("token");
            if (!token) {
                router.push("/login");
                return;
            }
            localStorage.setItem("token", token);
            setToken(token);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                },
            );
            const data = await response.json();
            setUser(data.user);
            router.push("/");
        }

        login();
    }, []);

    return (
        <div className="flex h-screen items-center justify-center">
            Logging you in...
        </div>
    );
}
