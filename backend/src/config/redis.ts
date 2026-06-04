import { createClient } from "redis";

export const redisPublisher = createClient({
    url: process.env.REDIS_URL,
});

export const redisSubscriber = redisPublisher.duplicate();

redisPublisher.on(
    "error",

    (err) => {
        console.error("Redis Publisher Error:", err);
    },
);

redisSubscriber.on(
    "error",

    (err) => {
        console.error("Redis Subscriber Error:", err);
    },
);

export async function connectRedis() {
    let connected = false;

    while (!connected) {
        try {
            await redisPublisher.connect();

            await redisSubscriber.connect();

            connected = true;

            console.log("Redis connected");
        } catch (error) {
            console.log("Waiting for Redis...");

            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
}
