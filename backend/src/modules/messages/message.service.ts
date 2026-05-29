import { createMessage } from "./message.repository";
import { PersistMessageDTO } from "./message.types";
import { getRoomMessages } from "./message.repository";
import { markMessageAsRead } from "./message.repository";
import { getUnreadCount } from "./message.repository";
import { editMessage, deleteMessage } from "./message.repository";
import { prisma } from "@database/prisma";

export async function createMessageService(data: PersistMessageDTO) {
    //
    // Future business logic:
    // validation
    // moderation
    // permissions
    // analytics
    //

    return createMessage(data);
}

export async function getRoomMessagesService(
    roomId: string,
    limit = 20,
    cursor?: string,
) {
    return getRoomMessages(roomId, limit, cursor);
}

export async function markMessageAsReadService(
    messageId: string,
    userId: string,
) {
    return markMessageAsRead(messageId, userId);
}

export async function getUnreadCountService(roomId: string, userId: string) {
    return getUnreadCount(roomId, userId);
}

export async function editMessageService(
    messageId: string,
    userId: string,
    content: string,
) {
    return editMessage(messageId, userId, content);
}

export async function deleteMessageService(messageId: string, userId: string) {
    return deleteMessage(messageId, userId);
}

export async function markMessagesAsReadService(
    roomId: string,
    userId: string,
) {
    const unreadMessages = await prisma.message.findMany({
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

    await prisma.messageRead.createMany({
        data: unreadMessages.map((message) => ({
            messageId: message.id,

            userId,
        })),

        skipDuplicates: true,
    });
}
