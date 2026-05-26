export enum NotificationType {
    MESSAGE = "MESSAGE",
    MENTION = "MENTION",
    ROOM_INVITE = "ROOM_INVITE"

}

export interface CreateNotificationDTO {
    userId: string;
    type: NotificationType;
    title: string;
    content?: string;
    metadata?: any;
}