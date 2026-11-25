/**
 * Multi-user group chat smoke test.
 *
 * Drives the real backend (REST + WebSocket) as two users and checks:
 *   1. A creates a group           5. B receives it instantly
 *   2. A adds B                    6. B replies, A receives it
 *   3. B gets ROOM_ADDED live      7. Both see the updated conversation
 *   4. A sends a message           8-10. B goes offline / comes back online
 *
 * Usage (backend + Postgres + Redis running):
 *   npx ts-node scripts/multiuser-smoke.ts [userAId] [userBId]
 *
 * Without ids, the first two users in the database are used.
 * The group it creates is deleted at the end.
 *
 * Multi-instance: point B at a second backend process to check
 * that room events and presence cross instances via Redis:
 *   SMOKE_API_URL_B=http://localhost:3001 npm run smoke:multiuser
 */
import "dotenv/config";
import jwt from "jsonwebtoken";
import WebSocket from "ws";
import { PrismaClient } from "../src/database/generated";

const API_URL = process.env.SMOKE_API_URL || `http://localhost:${process.env.PORT || 3000}`;
const WS_URL = process.env.SMOKE_WS_URL || API_URL.replace(/^http/, "ws") + "/ws";
const API_URL_B = process.env.SMOKE_API_URL_B || API_URL;
const WS_URL_B = process.env.SMOKE_WS_URL_B || API_URL_B.replace(/^http/, "ws") + "/ws";
const TIMEOUT_MS = 5000;

const prisma = new PrismaClient();

type Frame = { event: string; data: any };

class Client {
    private frames: Frame[] = [];
    private waiters: { match: (f: Frame) => boolean; resolve: (f: Frame) => void }[] = [];
    ws!: WebSocket;

    constructor(
        readonly name: string,
        readonly userId: string,
        readonly token: string,
        readonly apiUrl = API_URL,
        readonly wsUrl = WS_URL,
    ) { }

    connect() {
        return new Promise<void>((resolve, reject) => {
            this.frames = [];
            this.ws = new WebSocket(`${this.wsUrl}?token=${this.token}`);
            this.ws.on("open", () => resolve());
            this.ws.on("error", reject);
            this.ws.on("message", (raw) => {
                const frame = JSON.parse(raw.toString()) as Frame;
                const waiter = this.waiters.find((w) => w.match(frame));

                if (waiter) {
                    this.waiters = this.waiters.filter((w) => w !== waiter);
                    waiter.resolve(frame);
                } else {
                    this.frames.push(frame);
                }
            });
        });
    }

    close() {
        return new Promise<void>((resolve) => {
            this.ws.once("close", () => resolve());
            this.ws.close();
        });
    }

    send(event: string, data: unknown) {
        this.ws.send(JSON.stringify({ event, data }));
    }

    waitFor(event: string, predicate: (data: any) => boolean = () => true) {
        const match = (f: Frame) => f.event === event && predicate(f.data);
        const buffered = this.frames.find(match);

        if (buffered) {
            this.frames = this.frames.filter((f) => f !== buffered);
            return Promise.resolve(buffered.data);
        }

        return new Promise<any>((resolve, reject) => {
            const timer = setTimeout(
                () => reject(new Error(`${this.name} did not receive ${event} within ${TIMEOUT_MS}ms`)),
                TIMEOUT_MS,
            );

            this.waiters.push({
                match,
                resolve: (f) => {
                    clearTimeout(timer);
                    resolve(f.data);
                },
            });
        });
    }

    async api(method: string, path: string, body?: unknown) {
        const response = await fetch(`${this.apiUrl}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const text = await response.text();
        let parsed: any = text;

        try {
            parsed = JSON.parse(text);
        } catch {
            // Non-JSON (e.g. Express's HTML 404 page)
        }

        return { status: response.status, body: parsed };
    }
}

let step = 0;
function pass(message: string) {
    step += 1;
    console.log(`  ✔ ${step}. ${message}`);
}

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

async function main() {
    const secret = process.env.JWT_SECRET;
    assert(secret, "JWT_SECRET must be set");

    let [userAId, userBId] = process.argv.slice(2);

    if (!userAId || !userBId) {
        const users = await prisma.user.findMany({ take: 2, orderBy: { createdAt: "asc" } });
        assert(users.length === 2, "need at least two users in the database");
        [userAId, userBId] = users.map((u) => u.id);
    }

    const sign = (userId: string) => jwt.sign({ userId }, secret, { expiresIn: "10m" });
    const A = new Client("A", userAId, sign(userAId));
    const B = new Client("B", userBId, sign(userBId), API_URL_B, WS_URL_B);

    let roomId: string | undefined;

    console.log(`Smoke test: A=${userAId} on ${API_URL}, B=${userBId} on ${API_URL_B}`);

    try {
        //
        // The offline/online checks need B to have no other session
        // (e.g. a browser tab), or B correctly stays online
        //
        const probe = new Client("probe", A.userId, A.token);
        await probe.connect();
        const before = await probe.waitFor("ONLINE_USERS");
        await probe.close();
        assert(
            !before.userIds.includes(B.userId),
            "B is already online elsewhere (close their browser tabs first)",
        );

        await B.connect();
        await A.connect();
        await B.waitFor("USER_ONLINE", (d) => d.userId === A.userId);
        pass("both users connected; B saw A come online");

        const created = await A.api("POST", "/api/rooms", {
            name: `Orvexa Developers (smoke ${Date.now()})`,
            isGroup: true,
        });
        assert(created.status === 201, `create room returned ${created.status}`);
        roomId = created.body.room.id;
        assert(created.body.room.members.length === 1, "new room should have 1 member");
        pass(`A created group ${created.body.room.name}`);

        const added = await A.api("POST", `/api/rooms/${roomId}/add-member`, { userId: B.userId });
        assert(added.status === 201, `add-member returned ${added.status}: ${JSON.stringify(added.body)}`);
        pass("A added B");

        const roomAdded = await B.waitFor("ROOM_ADDED", (d) => d.id === roomId);
        assert(roomAdded.members.length === 2, "B's conversation should list 2 members");
        await A.waitFor("ROOM_MEMBER_ADDED", (d) => d.roomId === roomId && d.member.id === B.userId);
        pass("B got the group live (ROOM_ADDED); A saw B join (ROOM_MEMBER_ADDED)");

        const duplicate = await A.api("POST", `/api/rooms/${roomId}/add-member`, { userId: B.userId });
        assert(duplicate.status === 409, `duplicate add should be 409, got ${duplicate.status}`);
        pass("adding B twice is rejected with 409");

        A.send("SEND_MESSAGE", { roomId, type: "TEXT", content: "hello from A" });
        await A.waitFor("MESSAGE_DELIVERED");
        const toB = await B.waitFor("MESSAGE_RECEIVED", (d) => d.roomId === roomId);
        assert(toB.content === "hello from A", "B received wrong content");
        pass("A sent a message; B received it instantly without opening the room");

        B.send("START_TYPING", { roomId });
        await A.waitFor("USER_TYPING", (d) => d.userId === B.userId);
        B.send("SEND_MESSAGE", { roomId, type: "TEXT", content: "hey A, B here" });
        const toA = await A.waitFor("MESSAGE_RECEIVED", (d) => d.senderId === B.userId);
        assert(toA.content === "hey A, B here", "A received wrong content");
        pass("B typed and replied; A saw typing and received the reply");

        B.send("ROOM_MESSAGE_SEEN", { roomId });
        await A.waitFor("ROOM_MESSAGE_SEEN", (d) => d.userId === B.userId);
        pass("B read the room; A got the read receipt");

        const [convA, convB] = await Promise.all([
            A.api("GET", "/api/rooms/conversations"),
            B.api("GET", "/api/rooms/conversations"),
        ]);
        const roomForA = convA.body.conversations.find((c: any) => c.id === roomId);
        const roomForB = convB.body.conversations.find((c: any) => c.id === roomId);
        assert(roomForA && roomForB, "room missing from a sidebar");
        assert(roomForA.lastMessage.content === "hey A, B here", "A's last message is stale");
        assert(roomForB.lastMessage.content === "hey A, B here", "B's last message is stale");
        assert(roomForA.unreadCount === 1, `A should have 1 unread, has ${roomForA.unreadCount}`);
        assert(roomForB.unreadCount === 0, `B should have 0 unread, has ${roomForB.unreadCount}`);
        pass("both sidebars show the latest message and correct unread counts");

        await B.close();
        const offline = await A.waitFor("USER_OFFLINE", (d) => d.userId === B.userId);
        assert(offline.lastSeen, "USER_OFFLINE should include lastSeen");
        pass(`B closed the connection; A saw B go offline (lastSeen ${offline.lastSeen})`);

        await B.connect();
        await A.waitFor("USER_ONLINE", (d) => d.userId === B.userId);
        const snapshot = await B.waitFor("ONLINE_USERS");
        assert(snapshot.userIds.includes(A.userId), "B's online snapshot should include A");
        pass("B reconnected; A saw B online and B got the online snapshot");

        //
        // Room subscription on connect is async; give it a moment
        //
        await new Promise((r) => setTimeout(r, 300));
        A.send("SEND_MESSAGE", { roomId, type: "TEXT", content: "welcome back" });
        await B.waitFor("MESSAGE_RECEIVED", (d) => d.content === "welcome back");
        pass("after reconnecting, B still receives group messages");

        //
        // Authorization
        //
        const outsider = new Client("C", "smoke-outsider", sign("smoke-outsider"));
        const selfJoin = await outsider.api("POST", `/api/rooms/${roomId}/join`);
        assert(selfJoin.status === 404, `self-join route should be gone, got ${selfJoin.status}`);
        const unread = await outsider.api("GET", `/api/messages/rooms/${roomId}/unread`);
        assert(unread.status === 403, `non-member unread count should be 403, got ${unread.status}`);
        const history = await outsider.api("GET", `/api/messages/${roomId}/messages`);
        assert(history.status === 403, `non-member history should be 403, got ${history.status}`);
        const addByOutsider = await outsider.api("POST", `/api/rooms/${roomId}/add-member`, {
            userId: "smoke-outsider",
        });
        assert(addByOutsider.status === 403, `non-member add should be 403, got ${addByOutsider.status}`);
        pass("non-members cannot join, read history/unread, or add members");

        const notifications = await B.api("GET", "/api/notifications");
        assert(notifications.status === 200, `notifications returned ${notifications.status}`);
        const mine = notifications.body.notifications.find(
            (n: any) => n.metadata?.roomId === roomId,
        );
        assert(mine, "B should have a notification for A's message");
        const stolen = await A.api("PATCH", `/api/notifications/${mine.id}/read`);
        assert(stolen.status === 404, `A marking B's notification should be 404, got ${stolen.status}`);
        const own = await B.api("PATCH", `/api/notifications/${mine.id}/read`);
        assert(own.status === 200 && own.body.notification.isRead, "B could not mark own notification");
        pass("notifications load, and only their owner can mark them read");

        console.log(`\nAll ${step} checks passed.`);
    } finally {
        A.ws?.readyState === WebSocket.OPEN && (await A.close());
        B.ws?.readyState === WebSocket.OPEN && (await B.close());

        if (roomId) {
            await prisma.messageRead.deleteMany({ where: { message: { roomId } } });
            await prisma.message.deleteMany({ where: { roomId } });
            await prisma.notification.deleteMany({
                where: { metadata: { path: ["roomId"], equals: roomId } },
            });
            await prisma.roomMember.deleteMany({ where: { roomId } });
            await prisma.room.delete({ where: { id: roomId } });
            console.log("Cleaned up test room.");
        }

        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error(`\n✘ ${error.message}`);
    process.exitCode = 1;
});
