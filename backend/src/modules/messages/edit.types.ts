export interface EditMessageDTO {
    messageId: string;
    roomId: string;
    content: string;
}

export interface DeleteMessageDTO {
    messageId: string;
    roomId: string;
}
