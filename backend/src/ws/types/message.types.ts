export enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    FILE = "FILE",
    LINK = "LINK",
    SYSTEM = "SYSTEM",
}

export interface ChatMessage {
    roomId: string;
    senderId?: string;
    type: MessageType;
    content: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    createdAt?: Date;
}
