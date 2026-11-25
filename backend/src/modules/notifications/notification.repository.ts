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

export async function markNotificationAsRead(
    notificationId: string,
    userId: string,
) {
    const { count } = await prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId,
        },

        data: {
            isRead: true,
        },
    });

    if (count === 0) {
        return null;
    }

    return prisma.notification.findUnique({
        where: {
            id: notificationId,
        },
    });
}
