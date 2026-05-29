import { Request, Response } from "express";
import {
    createRoomService,
    joinRoomService,
    getUserRoomsService,
} from "./room.service";

import { createOrGetDirectRoomService } from "./room.service";
import { getUserConversationsService } from "./room.service";

export async function createRoomController(req: Request, res: Response) {
    try {
        const room = await createRoomService(
            {
                name: req.body.name,
                isGroup: req.body.isGroup,
            },
            req.userId!,
        );
        return res.status(201).json({
            success: true,
            room,
        });
    } catch (error) {
        console.error("CREATE ROOM ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to create room",
        });
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
        return res.status(500).json({
            success: false,

            message: "Failed to join room",
        });
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
        return res.status(500).json({
            success: false,

            message: "Failed to fetch rooms",
        });
    }
}

export async function createDirectRoomController(
    req: Request,

    res: Response,
) {
    try {
        const currentUserId = req.userId!;
        const { targetUserId } = req.body;

        const room = await createOrGetDirectRoomService(
            currentUserId,

            targetUserId,
        );

        return res.status(200).json({
            success: true,

            room,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,

            message:
                error instanceof Error ? error.message : "Failed to create direct room",
        });
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
        return res.status(500).json({
            success: false,

            message: "Failed to fetch conversations",
        });
    }
}

export async function addMemberController(
    req: Request,
    res: Response,
) {
    try {
        const roomId = req.params.roomId;
        const userId = req.body.userId;

        const membership = await joinRoomService(
            String(roomId),
            userId,
        );

        return res.status(200).json({
            success: true,
            membership,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add member",
        });
    }
}