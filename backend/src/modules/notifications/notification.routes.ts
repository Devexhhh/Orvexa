import { Router } from "express";
import { authenticate } from "@modules/auth/auth.middleware";
import {
    getNotificationsController,
    markNotificationAsReadController,
} from "./notification.controller";

const router = Router();

router.get(
    "/",
    authenticate,
    getNotificationsController,
);

router.patch(
    "/:notificationId/read",
    authenticate,
    markNotificationAsReadController,
);

export default router;
