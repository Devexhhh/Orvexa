import { Router } from "express";
import { authenticate } from "@modules/auth/auth.middleware";
import { addMemberController, getAllUsersController } from "./user.controller";

const router = Router();

router.get(
    "/",
    authenticate,
    getAllUsersController,
);

router.post(
    "/:roomId/add-member",
    authenticate,
    addMemberController,
);

export default router;