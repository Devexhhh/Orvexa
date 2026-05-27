import { Router } from "express";
import passport from "passport";
import { getCurrentUser, googleCallback } from "./auth.controller";
import { authenticate } from "./auth.middleware";

const router = Router();

router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    }),
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
    }),
    googleCallback,
);

router.get(

    "/me",
    authenticate,
    getCurrentUser,

);

export default router;
