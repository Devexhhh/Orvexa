import express from "express";
import cors from "cors";
import passport from "passport";
import "./modules/auth/passport";
import authRoutes from "./modules/auth/auth.routes";
import messageRoutes from "@modules/messages/message.routes";
import uploadRoutes from "@modules/uploads/upload.routes";
import roomRoutes from "@modules/rooms/room.routes";
import userRoutes from "@modules/users/user.route";
import path from "path";
import notificationRoutes from "@modules/notifications/notification.routes";
import { errorMiddleware } from "@shared/errors/errorMiddleware";

const app = express();

app.use(
    cors({
        origin: "http://localhost:3001",
        credentials: true,
    }),
);

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/users", userRoutes);

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "src/storage/uploads")),
);

app.use("/api/notifications", notificationRoutes);


app.use(errorMiddleware);

app.get("/", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Orvexa backend running",
    });
});

app.get("/health", (_, res) => {
    res.json({
        status: "ok",
    });
});

export default app;
