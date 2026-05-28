import {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
} from "./notification.repository";

import { CreateNotificationDTO } from "./notification.types";

export async function createNotificationService(data: CreateNotificationDTO) {
    return createNotification(data);
}

export async function getUserNotificationsService(userId: string) {
    return getUserNotifications(userId);
}

export async function markNotificationAsReadService(notificationId: string) {
    return markNotificationAsRead(notificationId);
}
