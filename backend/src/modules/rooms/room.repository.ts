import { prisma } from "@database/prisma";
import { CreateRoomDTO } from "./room.types";

export async function createRoom(data: CreateRoomDTO) {
    return prisma.room.create({
        data: {
            name: data.name,
            isGroup: data.isGroup || false,
        },
    });
}

export async function addUserToRoom(
    roomId: string,
    userId: string,
) {
    return prisma.roomMember.create({
        data: {
            roomId,
            userId,
        },
    });
}

export async function getUserRooms(userId: string) {
    return prisma.roomMember.findMany({
        where: {
            userId,
        },

        include: {
            room: true,
        },
    });
}

export async function isRoomMember(roomId: string, userId: string) {
    const membership = await prisma.roomMember.findUnique({
        where: {
            userId_roomId: {
                userId,
                roomId,
            },
        },
    });
    return !!membership;
}

export async function findDirectRoom(
    userA: string,
    userB: string,
) {
    const rooms = await prisma.room.findMany({
        where: {
            isDirect: true,
            members: {
                some: {
                    userId: userA,
                },
            },
        },

        include: {
            members: true,
        },
    });

    return rooms.find((room) => {
        const memberIds = room.members.map((member) => member.userId);

        return (
            memberIds.length === 2 &&
            memberIds.includes(userA) &&
            memberIds.includes(userB)
        );
    });
}

export async function createDirectRoom(
    userA: string,
    userB: string,
) {
    return prisma.room.create({
        data: {
            name: "Direct Chat",

            isGroup: false,

            isDirect: true,

            members: {
                create: [
                    {
                        userId: userA,
                    },

                    {
                        userId: userB,
                    },
                ],
            },
        },

        include: {
            members: true,
        },
    });
}

export async function getUserConversations(userId: string) {
    const memberships = await prisma.roomMember.findMany({
        where: {
            userId,
        },

        include: {
            room: {
                include: {
                    members: {
                        include: {
                            user: true,
                        },
                    },

                    messages: {
                        orderBy: {
                            createdAt: "desc",
                        },

                        take: 1,
                    },
                },
            },
        },
    });

    return Promise.all(
        memberships.map(async (membership) => {
            const room = membership.room;

            //
            // Find unread count
            //
            const unreadCount = await prisma.message.count({
                where: {
                    roomId: room.id,

                    senderId: {
                        not: userId,
                    },

                    reads: {
                        none: {
                            userId,
                        },
                    },
                },
            });

            //
            // Determine room display name
            //
            let displayName = room.name;

            let avatar: string | null = null;

            if (room.isDirect) {
                const otherUser = room.members.find(
                    (member) => member.userId !== userId,
                )?.user;

                if (otherUser) {
                    displayName = otherUser.username;

                    avatar = otherUser.avatar || null;
                }
            }

            return {
                roomId: room.id,
                name: displayName,
                avatar,
                isDirect: room.isDirect,
                isGroup: room.isGroup,
                unreadCount,
                lastMessage: room.messages[0] || null,
                updatedAt: room.messages[0]?.createdAt || room.createdAt,
            };
        }),
    );
}
