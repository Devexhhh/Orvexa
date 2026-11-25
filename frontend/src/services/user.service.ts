import { api } from "@/lib/api/client";

export interface UserSummary {
    id: string;
    username: string;
    avatar?: string | null;
    email?: string;
    lastSeen?: string | null;
}

export async function searchUsers(query: string) {
    const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
}

export async function getUsers(): Promise<UserSummary[]> {
    const response = await api.get("/api/users");
    return response.data.users;
}
