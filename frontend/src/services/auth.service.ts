import { api } from "@/lib/api/client";

export async function getCurrentUser() {
    const response = await api.get("/api/auth/me");
    return response.data;
}
