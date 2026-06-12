import { create } from "zustand";
import { Conversation } from "@/types/conversation";

interface RoomState {
    rooms: Conversation[];
    activeRoom: Conversation | null;
    setRooms: (rooms: Conversation[]) => void;
    setActiveRoom: (room: Conversation) => void;
    updateRoomLastMessage: (
        roomId: string,
        message: {
            content: string;
            createdAt: string;
        },
    ) => void;
    incrementUnread: (roomId: string) => void;

    clearUnread: (roomId: string) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
    rooms: [],
    activeRoom: null,
    setRooms: (rooms) =>
        set({
            rooms: [...rooms].sort(
                (a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            ),
        }),
    setActiveRoom: (room) =>
        set({
            activeRoom: room,
        }),
    updateRoomLastMessage: (
        roomId,

        message,
    ) =>
        set((state) => {
            const updatedRooms = state.rooms.map((room) =>
                room.id === roomId
                    ? {
                        ...room,

                        lastMessage: message,

                        updatedAt: message.createdAt,
                    }
                    : room,
            );

            updatedRooms.sort(
                (a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
            );

            return {
                rooms: updatedRooms,
            };
        }),
    incrementUnread: (roomId) =>
        set((state) => ({
            rooms: state.rooms.map((room) =>
                room.id === roomId
                    ? {
                        ...room,

                        unreadCount: room.unreadCount + 1,
                    }
                    : room,
            ),
        })),

    clearUnread: (roomId) =>
        set((state) => ({
            rooms: state.rooms.map((room) =>
                room.id === roomId
                    ? {
                        ...room,

                        unreadCount: 0,
                    }
                    : room,
            ),
        })),
}));
