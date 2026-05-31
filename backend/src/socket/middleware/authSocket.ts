import { IncomingMessage } from "http";

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthPayload {
    userId: string;
}

export function authenticateSocket(req: IncomingMessage) {
    try {
        const url = new URL(
            req.url!,

            `http://${req.headers.host}`,
        );

        const token = url.searchParams.get("token");

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(
            token,

            JWT_SECRET,
        ) as AuthPayload;

        return decoded;
    } catch (error) {
        console.error("Socket auth error:", error);

        return null;
    }
}
