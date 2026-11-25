import { create } from "zustand";
import { Conversation, ConversationMember } from "@/types/conversation";

interface RoomState {
    rooms: Conversation[];
    activeRoom: Conversation | null;
    setRooms: (rooms: Conversation[]) => void;
    upsertRoom: (room: Conversation) => void;
    setActiveRoom: (room: Conversation) => void;
    addRoomMember: (roomId: string, member: ConversationMember) => void;
    setMemberLastSeen: (userId: string, lastSeen: string) => void;
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

//
// The API sometimes returns `roomId` and sometimes `id`;
// always key rooms by `id` in the store.
//
export function normalizeRoom(room: Partial<Conversation> & { id?: string }) {
    const id = (room.id || room.roomId)!;

    return {
        ...room,
        id,
        roomId: id,
        unreadCount: room.unreadCount ?? 0,
        updatedAt:
            room.updatedAt ||
            (room as { createdAt?: string }).createdAt ||
            new Date().toISOString(),
        members: room.members ?? [],
    } as Conversation;
}

function sortRooms(rooms: Conversation[]) {
    return [...rooms].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

//
// Apply `update` to the matching room in the list and,
// if it is open, to the active room as well
//
function updateRoom(
    state: RoomState,
    roomId: string,
    update: (room: Conversation) => Conversation,
) {
    return {
        rooms: state.rooms.map((room) => (room.id === roomId ? update(room) : room)),
        activeRoom:
            state.activeRoom?.id === roomId
                ? update(state.activeRoom)
                : state.activeRoom,
    };
}

export const useRoomStore = create<RoomState>((set) => ({
    rooms: [],
    activeRoom: null,
    setRooms: (rooms) =>
        set({
            rooms: sortRooms(rooms.map(normalizeRoom)),
        }),
    upsertRoom: (incoming) =>
        set((state) => {
            const room = normalizeRoom(incoming);
            const exists = state.rooms.some((existing) => existing.id === room.id);

            return {
                rooms: sortRooms(
                    exists
                        ? state.rooms.map((existing) =>
                            existing.id === room.id ? { ...existing, ...room } : existing,
                        )
                        : [...state.rooms, room],
                ),
            };
        }),
    setActiveRoom: (room) =>
        set({
            activeRoom: normalizeRoom(room),
        }),
    addRoomMember: (roomId, member) =>
        set((state) =>
            updateRoom(state, roomId, (room) =>
                room.members.some((existing) => existing.id === member.id)
                    ? room
                    : { ...room, members: [...room.members, member] },
            ),
        ),
    setMemberLastSeen: (userId, lastSeen) =>
        set((state) => {
            const update = (room: Conversation) =>
                room.members.some((member) => member.id === userId)
                    ? {
                        ...room,
                        members: room.members.map((member) =>
                            member.id === userId ? { ...member, lastSeen } : member,
                        ),
                    }
                    : room;

            return {
                rooms: state.rooms.map(update),
                activeRoom: state.activeRoom ? update(state.activeRoom) : null,
            };
        }),
    updateRoomLastMessage: (roomId, message) =>
        set((state) => ({
            rooms: sortRooms(
                state.rooms.map((room) =>
                    room.id === roomId
                        ? {
                            ...room,
                            lastMessage: message,
                            updatedAt: message.createdAt,
                        }
                        : room,
                ),
            ),
        })),
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
