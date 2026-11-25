import { Router } from "express";
import { authenticate } from "@modules/auth/auth.middleware";
import { getAllUsersController } from "./user.controller";

const router = Router();

router.get(
    "/",
    authenticate,
    getAllUsersController,
);

//
// Adding members lives in the rooms module:
// POST /api/rooms/:roomId/add-member
//

export default router;
