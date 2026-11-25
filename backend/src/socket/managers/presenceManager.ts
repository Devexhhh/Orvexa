import { redisPublisher as redis } from "@config/redis";
import { SERVER_ID } from "@shared/constants/server";

//
// Presence across backend instances.
//
// Each instance owns one Redis hash (userId -> local socket count)
// that mirrors its in-memory map. The hash has a TTL that the
// heartbeat keeps refreshing, so if an instance crashes its users
// drop out of the online set on their own instead of staying
// "online" forever.
//
const SERVERS_KEY = "presence:servers";
const HEARTBEAT_MS = 10_000;
const TTL_SECONDS = 30;

const serverKey = (serverId: string) => `presence:server:${serverId}`;

class PresenceManager {
    private local: Map<string, number> = new Map();
    private heartbeat?: NodeJS.Timeout;

    //
    // Register this instance and keep its presence fresh
    //
    async start() {
        await this.sync();

        this.heartbeat = setInterval(() => {
            this.sync().catch((error) => {
                console.error("PRESENCE SYNC ERROR:", error);
            });
        }, HEARTBEAT_MS);

        this.heartbeat.unref();
    }

    //
    // Remove this instance's presence (graceful shutdown)
    //
    async stop() {
        if (this.heartbeat) {
            clearInterval(this.heartbeat);
        }

        await redis.del(serverKey(SERVER_ID));
        await redis.sRem(SERVERS_KEY, SERVER_ID);
    }

    //
    // A socket of `userId` connected to this instance
    //
    async addUser(userId: string) {
        const count = (this.local.get(userId) || 0) + 1;

        this.local.set(userId, count);

        await redis
            .multi()
            .hSet(serverKey(SERVER_ID), userId, count)
            .expire(serverKey(SERVER_ID), TTL_SECONDS)
            .sAdd(SERVERS_KEY, SERVER_ID)
            .exec();
    }

    //
    // A socket of `userId` disconnected from this instance
    //
    async removeUser(userId: string) {
        const current = this.local.get(userId);

        if (!current) {
            return;
        }

        if (current <= 1) {
            this.local.delete(userId);
            await redis.hDel(serverKey(SERVER_ID), userId);

            return;
        }

        this.local.set(userId, current - 1);
        await redis.hSet(serverKey(SERVER_ID), userId, current - 1);
    }

    //
    // Online on this instance or any other live instance
    //
    async isOnline(userId: string) {
        if (this.local.has(userId)) {
            return true;
        }

        const servers = await redis.sMembers(SERVERS_KEY);

        for (const serverId of servers) {
            if (serverId === SERVER_ID) {
                continue;
            }

            if (await redis.hExists(serverKey(serverId), userId)) {
                return true;
            }
        }

        return false;
    }

    //
    // Everyone online across all instances
    //
    async getOnlineUsers() {
        const online = new Set(this.local.keys());
        const servers = await redis.sMembers(SERVERS_KEY);

        for (const serverId of servers) {
            if (serverId === SERVER_ID) {
                continue;
            }

            const userIds = await redis.hKeys(serverKey(serverId));

            //
            // Hash expired: instance is gone (or has nobody
            // connected; it re-registers on its next write)
            //
            if (userIds.length === 0) {
                await redis.sRem(SERVERS_KEY, serverId);
                continue;
            }

            userIds.forEach((id) => online.add(id));
        }

        return Array.from(online);
    }

    //
    // Rewrite this instance's hash from memory and refresh its TTL.
    // Self-heals any drift (e.g. after a Redis restart).
    //
    private async sync() {
        const key = serverKey(SERVER_ID);
        const tx = redis.multi().del(key);

        if (this.local.size > 0) {
            tx.hSet(key, Object.fromEntries(this.local))
                .expire(key, TTL_SECONDS);
        }

        await tx.sAdd(SERVERS_KEY, SERVER_ID).exec();
    }
}

export const presenceManager = new PresenceManager();
