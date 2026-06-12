import { api } from "@/lib/api/client";

export async function searchUsers(query: string) {
    const response = await api.get(`/api/users/search?q=${query}`);
    return response.data;
}

export async function getUsers() {
    const response = await api.get("/api/users");
    return response.data.users;
}

export async function createDirectRoom(
    targetUserId: string,
) {
    const response = await api.post(
        "/api/rooms/direct",
        {
            targetUserId,
        },
    );

    return response.data.room;
}

export async function addMember(
    roomId: string,
    userId: string,
) {
    return api.post(
        `/api/rooms/${roomId}/add-member`,
        {
            userId,
        },
    );
}