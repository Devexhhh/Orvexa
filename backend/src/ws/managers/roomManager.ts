import { CustomWebSocket } from "../types/ws.types";

class RoomManager {

    private rooms:
        Map<string, Set<CustomWebSocket>> = new Map();

    //
    // Join Room
    //
    joinRoom(
        roomId: string,
        ws: CustomWebSocket
    ) {

        if (!this.rooms.has(roomId)) {

            this.rooms.set(
                roomId,
                new Set()
            );

        }

        this.rooms.get(roomId)?.add(ws);

        ws.roomId = roomId;

        console.log(
            `Socket joined room: ${roomId}`
        );

    }

    //
    // Leave Room
    //
    leaveRoom(
        roomId: string,
        ws: CustomWebSocket
    ) {

        const room = this.rooms.get(roomId);

        if (!room) return;

        room.delete(ws);

        //
        // Remove empty room
        //
        if (room.size === 0) {

            this.rooms.delete(roomId);

        }

        console.log(
            `Socket left room: ${roomId}`
        );

    }

    //
    // Broadcast To Room
    //
    broadcastToRoom(
        roomId: string,
        payload: any
    ) {

        const room = this.rooms.get(roomId);

        if (!room) return;

        room.forEach((client) => {

            if (
                client.readyState === client.OPEN
            ) {

                client.send(
                    JSON.stringify(payload)
                );

            }

        });

    }

    //
    // Remove socket from all rooms
    //
    removeSocket(
        ws: CustomWebSocket
    ) {

        this.rooms.forEach(
            (clients, roomId) => {

                if (clients.has(ws)) {

                    clients.delete(ws);

                    if (clients.size === 0) {

                        this.rooms.delete(roomId);

                    }

                }

            }
        );

    }

    //
    // Get room users count
    //
    getRoomSize(roomId: string) {

        return (
            this.rooms.get(roomId)?.size || 0
        );

    }

}

export const roomManager =
    new RoomManager();