import { prisma } from "@database/prisma";

export async function updateLastSeen(userId: string) {
    return prisma.user.updateMany({
        where: {
            id: userId,
        },
        data: {
            lastSeen: new Date(),
        },
    });
}

export async function getAllUsers(currentUserId: string) {
    return prisma.user.findMany({
        where: {
            id: {
                not: currentUserId,
            },
        },

        select: {
            id: true,
            username: true,
            avatar: true,
            email: true,
            lastSeen: true,
        },
    });
}