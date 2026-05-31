import { getAllUsers, updateLastSeen } from "./user.repository";

export async function updateLastSeenService(userId: string) {
    return updateLastSeen(userId);
}

export async function getAllUsersService(
    currentUserId: string,
) {
    return getAllUsers(currentUserId);
}