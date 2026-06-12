import { api } from "@/lib/api/client";

export async function getRooms() {
    const response = await api.get("/api/rooms");
    return response.data;
}

export async function createRoom(payload: { name: string; isGroup: boolean }) {
    const response = await api.post(
        "/api/rooms",
        payload,
    );
    return response.data;
}

export async function createDirectRoom(targetUserId: string) {
    const response = await api.post("/api/rooms/direct", {
        targetUserId,
    });
    return response.data;
}

export async function getConversations() {
    const response =
        await api.get(
            "/api/rooms/conversations",
        );
    return response.data;

}

export async function joinRoom(
    roomId: string,
) {
    const response = await api.post(
        `/api/rooms/${roomId}/join`,
    );

    return response.data;
}