import { z } from "zod";

export const createRoomSchema = z.object({
    name: z.string().trim().min(1).max(100),
    isGroup: z.boolean().optional(),
});

export const addMemberSchema = z.object({
    userId: z.string().min(1),
});

export const createDirectRoomSchema = z.object({
    targetUserId: z.string().min(1),
});
