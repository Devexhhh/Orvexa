import { Router } from "express";

import {
    getRoomMessagesController,
    getUnreadCountController,
} from "./message.controller";

import { authenticate } from "@modules/auth/auth.middleware";

const router = Router();

router.get(
    "/:roomId/messages",
    authenticate,
    getRoomMessagesController,
);

router.get(
    "/rooms/:roomId/unread",
    authenticate,
    getUnreadCountController,
);

export default router;
