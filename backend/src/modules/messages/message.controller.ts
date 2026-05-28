import { Request, Response } from "express";
import { getRoomMessagesService } from "./message.service";
import { isRoomMemberService } from "@modules/rooms/room.service";
import { getUnreadCountService } from "./message.service";

export async function getRoomMessagesController(req: Request, res: Response) {
    try {
        const roomId =
            String(req.params.roomId);;
        const userId = req.userId!;
        const isMember = await isRoomMemberService(roomId, userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }
        const limit = Number(req.query.limit) || 20;
        const cursor =
            typeof req.query.cursor === "string" ? req.query.cursor : undefined;
        const messages = await getRoomMessagesService(roomId, limit, cursor);

        return res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
        });
    }
}

export async function getUnreadCountController(
    req: Request,

    res: Response,
) {
    try {
        const roomId = String(req.params.roomId);;
        const userId = req.userId!;
        const count = await getUnreadCountService(
            roomId,
            userId,
        );

        return res.status(200).json({
            success: true,

            unreadCount: count,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch unread count",
        });
    }
}
