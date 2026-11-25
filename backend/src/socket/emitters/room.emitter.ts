import { SocketEvent } from "../types/event.types";
import { broadcastMessage } from "../utils/broadcast";
import { emitToUser } from "../utils/userEmitter";

interface RoomMemberSummary {
    id: string;
    username: string;
    avatar: string | null;
    lastSeen: Date | null;
}

//
// A user was added to a group:
// - existing members see the new member
// - the new member gets the room and is subscribed to it
//
export async function notifyMemberAdded(
    roomId: string,
    member: RoomMemberSummary,
    conversation: unknown,
) {
    await broadcastMessage(roomId, SocketEvent.ROOM_MEMBER_ADDED, {
        roomId,
        member,
    });

    await emitToUser(member.id, SocketEvent.ROOM_ADDED, conversation, {
        subscribeRoomId: roomId,
    });
}

//
// A conversation was created that `userId` did not open themselves
//
export async function notifyRoomAdded(
    userId: string,
    roomId: string,
    conversation: unknown,
) {
    await emitToUser(userId, SocketEvent.ROOM_ADDED, conversation, {
        subscribeRoomId: roomId,
    });
}
