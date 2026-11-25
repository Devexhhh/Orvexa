import { getAllUsers, updateLastSeen } from "./user.repository";

export async function updateLastSeenService(
    userId: string,
    lastSeen = new Date(),
) {
    return updateLastSeen(userId, lastSeen);
}

export async function getAllUsersService(
    currentUserId: string,
) {
    return getAllUsers(currentUserId);
}