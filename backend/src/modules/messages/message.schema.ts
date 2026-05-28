import { z } from "zod";
import { MessageType } from "./message.types";

export const createMessageSchema = z.object({
    roomId: z.string().min(1),
    type: z.enum(MessageType),
    content: z.string().min(1),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
});
