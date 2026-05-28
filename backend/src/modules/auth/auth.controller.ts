import { Request, Response } from "express";
import { generateToken } from "./jwt";
import { prisma } from "@database/prisma";

export function googleCallback(req: Request, res: Response) {
    const user = req.user as any;
    const token = generateToken(user.id);
    const frontendUrl = "http://localhost:3001/auth/callback";
    return res.redirect(`${frontendUrl}?token=${token}`);
}

export async function getCurrentUser(req: Request, res: Response) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        res.setHeader("Cache-Control", "no-store");

        return res.status(200).json({
            success: true,

            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
}
