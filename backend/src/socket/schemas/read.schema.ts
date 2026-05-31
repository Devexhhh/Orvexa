import { z } from "zod";

export const markAsReadSchema = z.object({
    roomId: z.string(),
    messageId: z.string(),
});

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
