import { prisma } from "@database/prisma";
import { createNotificationService } from "@modules/notifications/notification.service";
import { NotificationType } from "@modules/notifications/notification.types";
import { sendNotificationToUser } from "./notification.handler";
import { CustomWebSocket } from "../types/ws.types";
import { SocketEvent } from "../types/event.types";
import { broadcastMessage } from "../utils/broadcast";
import { createMessageService } from "@modules/messages/message.service";
import { MessageType } from "@modules/messages/message.types";
import { createMessageSchema } from "@modules/messages/message.schema";

export async function handleSendMessage(ws: CustomWebSocket, data: any) {
    const validatedData = createMessageSchema.parse(data);
    const savedMessage = await createMessageService({
        roomId: validatedData.roomId,
        senderId: ws.userId!,
        type: validatedData.type || MessageType.TEXT,
        content: validatedData.content,
        fileUrl: validatedData.fileUrl,
        fileName: validatedData.fileName,
        fileSize: validatedData.fileSize,
    });

    broadcastMessage(
        validatedData.roomId,
        SocketEvent.MESSAGE_RECEIVED,
        savedMessage,
    );
    //
    // Notify room members
    //
    const roomMembers = await prisma.roomMember.findMany({
        where: {
            roomId: data.roomId,
            userId: {
                not: ws.userId,
            },
        },
        include: {
            user: true,
        },
    });

    for (const member of roomMembers) {
        const notification = await createNotificationService({
            userId: member.userId,
            type: NotificationType.MESSAGE,
            title: "New Message",
            content: savedMessage.content,
            metadata: {
                roomId: data.roomId,

                messageId: savedMessage.id,
            },
        });

        sendNotificationToUser(
            member.userId,
            notification,
        );
    }
    ws.send(
        JSON.stringify({
            event: SocketEvent.MESSAGE_DELIVERED,
            data: {
                messageId: savedMessage.id,
            },
        }),
    );
}
