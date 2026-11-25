import { Request, Response } from "express";
import { getAllUsersService } from "./user.service";

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
