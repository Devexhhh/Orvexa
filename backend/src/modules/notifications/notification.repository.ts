import { prisma } from "@database/prisma";
import { CreateNotificationDTO } from "./notification.types";

export async function createNotification(data: CreateNotificationDTO) {
    return prisma.notification.create({
        data,
    });
}

export async function getUserNotifications(userId: string) {
    return prisma.notification.findMany({
        where: {
            userId,
        },

        orderBy: {
            createdAt: "desc",
        },

        take: 50,
    });
}

export async function markNotificationAsRead(notificationId: string) {
    return prisma.notification.update({
        where: {
            id: notificationId,
        },

        data: {
            isRead: true,
        },
    });
}
