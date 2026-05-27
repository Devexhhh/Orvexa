import { Request, Response } from "express";
import { generateToken } from "./jwt";

export function googleCallback(
    req: Request,
    res: Response,
) {
    const user = req.user as any;
    const token = generateToken(user.id);
    const frontendUrl = "http://localhost:3001/auth/callback";
    return res.redirect(`${frontendUrl}?token=${token}`);
}

export function getCurrentUser(
    req: Request,
    res: Response,
) {

    return res.status(200).json({
        success: true,
        user: req.user,
    });

}