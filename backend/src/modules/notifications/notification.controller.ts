import { Request, Response } from "express";

import {
    getUserNotificationsService,
    markNotificationAsReadService,
} from "./notification.service";

export async function getNotificationsController(
    req: Request,
    res: Response,
) {
    try {
        const userId = req.user!.id;
        const notifications = await getUserNotificationsService(userId);

        return res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
}

export async function markNotificationAsReadController(
    req: Request,
    res: Response,
) {
    try {
        const notificationId = String(req.params.notificationId);
        const notification = await markNotificationAsReadService(notificationId);

        return res.status(200).json({
            success: true,
            notification,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update notification",
        });
    }
}
