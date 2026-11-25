import { Request, Response } from "express";
import { AppError } from "@shared/errors/AppError";
import {
    createRoomService,
    joinRoomService,
    getUserRoomsService,
    addMemberService,
    createOrGetDirectRoomService,
    getUserConversationsService,
} from "./room.service";
import {
    addMemberSchema,
    createDirectRoomSchema,
    createRoomSchema,
} from "./room.schema";
import {
    notifyMemberAdded,
    notifyRoomAdded,
} from "@socket/emitters/room.emitter";

function sendError(res: Response, error: unknown, fallback: string) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }

    console.error(fallback, error);

    return res.status(500).json({
        success: false,
        message: fallback,
    });
}

export async function createRoomController(req: Request, res: Response) {
    try {
        const parsed = createRoomSchema.safeParse(req.body);

        if (!parsed.success) {
            throw new AppError("Room name is required", 400);
        }

        const room = (await createRoomService(parsed.data, req.userId!))!;

        //
        // Subscribe the creator's sockets (all tabs) and show it there
        //
        await notifyRoomAdded(req.userId!, room.id, room);

        return res.status(201).json({
            success: true,
            room,
        });
    } catch (error) {
        return sendError(res, error, "Failed to create room");
    }
}

export async function joinRoomController(req: Request, res: Response) {
    try {
        const roomId = String(req.params.roomId);
        const userId = req.userId!;

        const membership = await joinRoomService(roomId, userId);

        return res.status(200).json({
            success: true,

            membership,
        });
    } catch (error) {
        return sendError(res, error, "Failed to join room");
    }
}

export async function getUserRoomsController(req: Request, res: Response) {
    try {
        const userId = req.userId!;
        const rooms = await getUserRoomsService(userId);
        return res.status(200).json({
            success: true,

            rooms,
        });
    } catch (error) {
        return sendError(res, error, "Failed to fetch rooms");
    }
}

export async function createDirectRoomController(
    req: Request,
    res: Response,
) {
    try {
        const parsed = createDirectRoomSchema.safeParse(req.body);

        if (!parsed.success) {
            throw new AppError("targetUserId is required", 400);
        }

        const { targetUserId } = parsed.data;

        const result = await createOrGetDirectRoomService(
            req.userId!,
            targetUserId,
        );

        //
        // New DM: make it appear for the other user too
        //
        if (result.created && result.targetConversation) {
            await notifyRoomAdded(
                req.userId!,
                result.conversation.id,
                result.conversation,
            );

            await notifyRoomAdded(
                targetUserId,
                result.conversation.id,
                result.targetConversation,
            );
        }

        return res.status(result.created ? 201 : 200).json({
            success: true,
            room: result.conversation,
        });
    } catch (error) {
        return sendError(res, error, "Failed to create direct room");
    }
}

export async function getUserConversationsController(
    req: Request,
    res: Response,
) {
    try {
        const userId = req.userId!;
        const conversations = await getUserConversationsService(userId);

        return res.status(200).json({
            success: true,
            conversations,
        });
    } catch (error) {
        return sendError(res, error, "Failed to fetch conversations");
    }
}

export async function addMemberController(
    req: Request,
    res: Response,
) {
    try {
        const parsed = addMemberSchema.safeParse(req.body);

        if (!parsed.success) {
            throw new AppError("userId is required", 400);
        }

        const roomId = String(req.params.roomId);

        const { membership, member, conversation } = await addMemberService(
            roomId,
            req.userId!,
            parsed.data.userId,
        );

        await notifyMemberAdded(roomId, member, conversation);

        return res.status(201).json({
            success: true,
            membership,
            member,
        });
    } catch (error) {
        return sendError(res, error, "Failed to add member");
    }
}
