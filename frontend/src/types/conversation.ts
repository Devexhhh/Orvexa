export interface Conversation {
    id: string;
    name: string;
    avatar?: string | null;
    roomId?: string | null;
    isDirect: boolean;
    isGroup: boolean;
    unreadCount: number;
    updatedAt: string;
    lastMessage?: {
        content: string;
        createdAt: string;
    } | null;
}
