import { api } from "@/lib/api/client";

export async function getMessages(roomId: string, cursor?: string) {
    const params = new URLSearchParams();
    params.append("limit", "20");
    if (cursor) {
        params.append("cursor", cursor);
    }
    const response = await api.get(
        `/api/messages/${roomId}/messages?${params.toString()}`,
    );
    return response.data;
}
