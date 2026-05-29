import { Router } from "express";
import { authenticate } from "@modules/auth/auth.middleware";
import {
    createRoomController,
    joinRoomController,
    getUserRoomsController,
    createDirectRoomController,
    getUserConversationsController,
    addMemberController,
} from "./room.controller";

const router = Router();

router.post(
    "/",
    authenticate,
    createRoomController,
);

router.post("/:roomId/join", authenticate, joinRoomController);

router.get(
    "/",
    authenticate,
    getUserRoomsController,
);

router.post(
    "/direct",
    authenticate,
    createDirectRoomController,
);

router.get(
    "/conversations",
    authenticate,
    getUserConversationsController
);

router.post(
    "/:roomId/add-member",
    authenticate,
    addMemberController,
);

export default router;
