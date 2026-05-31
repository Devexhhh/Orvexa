import { z } from "zod";

export const editMessageSchema = z.object({
    roomId: z.string(),
    messageId: z.string(),
    content: z.string().min(1),
});

export const deleteMessageSchema = z.object({
    roomId: z.string(),
    messageId: z.string(),
});
