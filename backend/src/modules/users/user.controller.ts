import { Request, Response } from "express";
import { getAllUsersService } from "./user.service";
import { joinRoomService } from "@modules/rooms/room.service";

export async function getAllUsersController(
    req: Request,
    res: Response,
) {
    try {
        const users = await getAllUsersService(
            req.userId!,
        );

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
}

export async function addMemberController(
    req: Request,
    res: Response,
) {
    const membership =
        await joinRoomService(
            String(req.params.roomId),
            req.body.userId,
        );

    res.json({
        success: true,
        membership,
    });
}