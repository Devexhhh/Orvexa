import {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
} from "./notification.repository";

import { CreateNotificationDTO } from "./notification.types";
import { AppError } from "@shared/errors/AppError";

export async function createNotificationService(data: CreateNotificationDTO) {
    return createNotification(data);
}

export async function getUserNotificationsService(userId: string) {
    return getUserNotifications(userId);
}

export async function markNotificationAsReadService(
    notificationId: string,
    userId: string,
) {
    const notification = await markNotificationAsRead(notificationId, userId);

    if (!notification) {
        throw new AppError("Notification not found", 404);
    }

    return notification;
}
