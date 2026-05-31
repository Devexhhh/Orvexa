import { z } from "zod";
import { MessageType } from "@modules/messages/message.types";

export const sendMessageSchema = z.object({
    roomId: z.string().min(1),
    type: z.enum(MessageType),
    content: z.string().min(1),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
