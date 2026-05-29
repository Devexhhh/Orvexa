export enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    FILE = "FILE",
    LINK = "LINK",
    SYSTEM = "SYSTEM"

}

//
// Raw client payload
//
export interface CreateMessageDTO {
    roomId: string;
    type: MessageType;
    content: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;

}

//
// Backend persistence payload
//
export interface PersistMessageDTO {
    roomId: string;
    senderId: string;
    type: MessageType;
    content: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;

}

//
// Stored message
//
export interface ChatMessage {
    id?: string;
    roomId: string;
    senderId: string;
    type: MessageType;
    content: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    createdAt?: Date;

}