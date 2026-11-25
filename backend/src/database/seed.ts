/**
 * Local development seed.
 *
 * Creates two test users so multi-user flows can be exercised
 * without two Google accounts (see scripts/multiuser-smoke.ts).
 * Safe to run repeatedly.
 *
 *   npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "./generated";

const prisma = new PrismaClient();

const TEST_USERS = [
    {
        googleId: "seed-test-user-a",
        email: "test-user-a@orvexa.test",
        username: "Test User A",
    },
    {
        googleId: "seed-test-user-b",
        email: "test-user-b@orvexa.test",
        username: "Test User B",
    },
];

async function main() {
    for (const user of TEST_USERS) {
        const saved = await prisma.user.upsert({
            where: { googleId: user.googleId },
            update: {},
            create: user,
        });

        console.log(`${saved.username}: ${saved.id}`);
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
