import { CustomWebSocket } from "../types/ws.types";

class RoomManager {
    //
    // roomId -> sockets
    //
    private rooms: Map<string, Set<CustomWebSocket>> = new Map();

    //
    // userId -> sockets
    //
    private userSockets: Map<string, Set<CustomWebSocket>> = new Map();

    //
    // Register user socket
    //
    registerUserSocket(ws: CustomWebSocket) {
        const userId = ws.userId;

        if (!userId) {
            return;
        }

        if (!this.userSockets.has(userId)) {
            this.userSockets.set(
                userId,

                new Set(),
            );
        }

        this.userSockets.get(userId)!.add(ws);
    }

    //
    // Get user sockets
    //
    getUserSockets(userId: string): Set<CustomWebSocket> {
        return this.userSockets.get(userId) || new Set();
    }

    //
    // Join Room
    //
    joinRoom(
        roomId: string,

        ws: CustomWebSocket,
    ) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(
                roomId,

                new Set(),
            );
        }

        this.rooms.get(roomId)?.add(ws);
    }

    //
    // Subscribe every local socket of a user to a room
    // (e.g. right after they are added to it)
    //
    joinRoomForUser(roomId: string, userId: string) {
        this.getUserSockets(userId).forEach((socket) => {
            this.joinRoom(roomId, socket);
        });
    }

    //
    // Is this socket subscribed to the room?
    //
    isInRoom(roomId: string, ws: CustomWebSocket) {
        return this.rooms.get(roomId)?.has(ws) ?? false;
    }

    //
    // Leave Room
    //
    leaveRoom(
        roomId: string,

        ws: CustomWebSocket,
    ) {
        const room = this.rooms.get(roomId);

        if (!room) {
            return;
        }

        room.delete(ws);

        //
        // Remove empty room
        //
        if (room.size === 0) {
            this.rooms.delete(roomId);
        }

        console.log(`Socket left room: ${roomId}`);
    }

    //
    // Broadcast To Room
    //
    broadcastToRoom(
        roomId: string,
        payload: any,
    ) {

        const room = this.rooms.get(roomId);

        if (!room) {
            return;
        }

        room.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(payload));
            }
        });
    }

    //
    // Broadcast to every socket on this instance
    //
    broadcastToAll(payload: unknown) {
        const message = JSON.stringify(payload);

        this.userSockets.forEach((sockets) => {
            sockets.forEach((client) => {
                if (client.readyState === client.OPEN) {
                    client.send(message);
                }
            });
        });
    }

    //
    // Remove socket completely
    //
    removeSocket(ws: CustomWebSocket) {
        //
        // Remove from rooms
        //
        this.rooms.forEach((clients, roomId) => {
            if (clients.has(ws)) {
                clients.delete(ws);

                if (clients.size === 0) {
                    this.rooms.delete(roomId);
                }
            }
        });

        //
        // Remove from user sockets
        //
        const userId = ws.userId;

        if (!userId) {
            return;
        }

        const sockets = this.userSockets.get(userId);

        if (!sockets) {
            return;
        }

        sockets.delete(ws);

        if (sockets.size === 0) {
            this.userSockets.delete(userId);
        }
    }

    //
    // Get room users count
    //
    getRoomSize(roomId: string) {
        return this.rooms.get(roomId)?.size || 0;
    }
}

export const roomManager = new RoomManager();
