import { AppError } from "@shared/errors/AppError";
import { prisma } from "@database/prisma";
import { CreateRoomDTO } from "./room.types";
import {
    createRoom,
    addUserToRoom,
    getUserRooms,
    getUserRoomIds,
    isRoomMember,
    findRoomById,
    findDirectRoom,
    createDirectRoom,
    getUserConversations,
    getConversationForUser,
} from "./room.repository";

export async function createRoomService(
    data: CreateRoomDTO,
    creatorId: string,
) {
    const room = await createRoom(data);
    await addUserToRoom(
        room.id,
        creatorId,
    );
    return getConversationForUser(room.id, creatorId);
}

export async function joinRoomService(roomId: string, userId: string) {
    return addUserToRoom(roomId, userId);
}

//
// Add `targetUserId` to a group room on behalf of `requesterId`.
// Returns the new member and the room as the added user sees it,
// so the caller can notify both sides in realtime.
//
export async function addMemberService(
    roomId: string,
    requesterId: string,
    targetUserId: string,
) {
    const room = await findRoomById(roomId);

    if (!room) {
        throw new AppError("Room not found", 404);
    }

    if (room.isDirect || !room.isGroup) {
        throw new AppError("Members can only be added to group rooms", 400);
    }

    if (!(await isRoomMember(roomId, requesterId))) {
        throw new AppError("You are not a member of this room", 403);
    }

    const targetUser = await prisma.user.findUnique({
        where: {
            id: targetUserId,
        },
        select: {
            id: true,
            username: true,
            avatar: true,
            lastSeen: true,
        },
    });

    if (!targetUser) {
        throw new AppError("User not found", 404);
    }

    if (await isRoomMember(roomId, targetUserId)) {
        throw new AppError("User is already a member of this room", 409);
    }

    const membership = await addUserToRoom(roomId, targetUserId);

    const conversation = await getConversationForUser(roomId, targetUserId);

    return {
        membership,
        member: targetUser,
        conversation: conversation!,
    };
}

export async function getUserRoomsService(userId: string) {
    return getUserRooms(userId);
}

export async function getUserRoomIdsService(userId: string) {
    return getUserRoomIds(userId);
}

export async function isRoomMemberService(roomId: string, userId: string) {
    return isRoomMember(roomId, userId);
}

//
// Returns the conversation for the current user, plus
// the conversation for the other user when the room is new
// (so the caller can push it to them in realtime).
//
export async function createOrGetDirectRoomService(
    currentUserId: string,
    targetUserId: string,
) {
    if (!targetUserId) {
        throw new AppError("targetUserId is required", 400);
    }

    if (currentUserId === targetUserId) {
        throw new AppError("Cannot create direct chat with yourself", 400);
    }

    const existingRoom = await findDirectRoom(currentUserId, targetUserId);

    if (existingRoom) {
        return {
            created: false,
            conversation: (await getConversationForUser(
                existingRoom.id,
                currentUserId,
            ))!,
            targetConversation: null,
        };
    }

    const room = await createDirectRoom(currentUserId, targetUserId);

    const [conversation, targetConversation] = await Promise.all([
        getConversationForUser(room.id, currentUserId),
        getConversationForUser(room.id, targetUserId),
    ]);

    return {
        created: true,
        conversation: conversation!,
        targetConversation: targetConversation!,
    };
}

export async function getUserConversationsService(userId: string) {
    const conversations = await getUserConversations(userId);

    return conversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}
