import { redisPublisher } from "@config/redis";
import { SERVER_ID } from "@shared/constants/server";

export async function publishSocketEvent(
    channel: string,
    payload: any,
) {
    await redisPublisher.publish(
        channel,
        JSON.stringify({
            ...payload,
            serverId: SERVER_ID,
        }),
    );
}
