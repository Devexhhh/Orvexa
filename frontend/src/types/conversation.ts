export interface ConversationMember {
    id: string;
    username: string;
    avatar?: string | null;
    lastSeen?: string | null;
}

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
    members: ConversationMember[];
}
