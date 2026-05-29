import { prisma } from "@database/prisma";
import { PersistMessageDTO } from "./message.types";

export async function createMessage(data: PersistMessageDTO) {
    return prisma.message.create({
        data: {
            roomId: data.roomId,
            senderId: data.senderId,
            type: data.type,
            content: data.content,
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
        },
        include: {
            sender: true,
        },
    });
}

export async function getRoomMessages(
    roomId: string,
    limit = 20,
    cursor?: string,
) {
    return prisma.message.findMany({
        where: {
            roomId,
        },

        include: {
            sender: {
                select: {
                    username: true,

                    avatar: true,
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },

        take: limit,

        cursor: cursor
            ? {
                id: cursor,
            }
            : undefined,
        skip: cursor ? 1 : 0,
    });
}

export async function markMessageAsRead(messageId: string, userId: string) {
    return prisma.messageRead.upsert({
        where: {
            messageId_userId: {
                messageId,

                userId,
            },
        },

        update: {},

        create: {
            messageId,

            userId,
        },
    });
}

export async function getUnreadCount(roomId: string, userId: string) {
    return prisma.message.count({
        where: {
            roomId,

            senderId: {
                not: userId,
            },

            reads: {
                none: {
                    userId,
                },
            },
        },
    });
}

export async function editMessage(
    messageId: string,
    userId: string,
    content: string,
) {
    const message = await prisma.message.findFirst({
        where: {
            id: messageId,
            senderId: userId,
        },
    });

    if (!message) {
        throw new Error("Message not found");
    }

    return prisma.message.update({
        where: {
            id: messageId,
        },
        data: {
            content,
            isEdited: true,
            editedAt: new Date(),
        },
    });
}

export async function deleteMessage(messageId: string, userId: string) {
    return prisma.message.updateMany({
        where: {
            id: messageId,
            senderId: userId,
        },

        data: {
            isDeleted: true,
            deletedAt: new Date(),
            content: "This message was deleted",
        },
    });
}
