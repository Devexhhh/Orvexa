import { createRoom, addUserToRoom, getUserRooms } from "./room.repository";
import { CreateRoomDTO } from "./room.types";
import { isRoomMember } from "./room.repository";
import { findDirectRoom, createDirectRoom } from "./room.repository";
import { getUserConversations } from "./room.repository";

export async function createRoomService(
    data: CreateRoomDTO,
    creatorId: string,
) {
    const room = await createRoom(data);
    await addUserToRoom(
        room.id,
        creatorId,
    );
    return room;
}

export async function joinRoomService(roomId: string, userId: string) {
    return addUserToRoom(roomId, userId);
}

export async function getUserRoomsService(userId: string) {
    return getUserRooms(userId);
}

export async function isRoomMemberService(roomId: string, userId: string) {
    return isRoomMember(roomId, userId);
}

export async function createOrGetDirectRoomService(
    currentUserId: string,
    targetUserId: string,
) {
    //
    // Prevent self-DM
    //
    if (currentUserId === targetUserId) {
        throw new Error("Cannot create direct chat with yourself");
    }

    const existingRoom = await findDirectRoom(currentUserId, targetUserId);

    if (existingRoom) {
        return existingRoom;
    }

    return createDirectRoom(
        currentUserId,

        targetUserId,
    );
}

export async function getUserConversationsService(userId: string) {
    const conversations = await getUserConversations(userId);

    return conversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}
