const RATE_LIMIT_WINDOW = 10 * 1000;
const MAX_EVENTS_PER_WINDOW = 30;

interface UserRateData {
    count: number;

    windowStart: number;
}

const userRateLimits = new Map<string, UserRateData>();

export function checkRateLimit(userId: string) {
    const now = Date.now();

    const existing = userRateLimits.get(userId);

    //
    // First request
    //
    if (!existing) {
        userRateLimits.set(userId, {
            count: 1,
            windowStart: now,
        });
        return true;
    }

    //
    // Reset window
    //
    if (now - existing.windowStart > RATE_LIMIT_WINDOW) {
        userRateLimits.set(userId, {
            count: 1,
            windowStart: now,
        });
        return true;
    }

    //
    // Block if exceeded
    //
    if (existing.count >= MAX_EVENTS_PER_WINDOW) {
        return false;
    }

    //
    // Increment counter
    //
    existing.count += 1;

    return true;
}

setInterval(() => {
    const now = Date.now();
    userRateLimits.forEach((data, userId) => {
        if (now - data.windowStart > RATE_LIMIT_WINDOW) {
            userRateLimits.delete(userId);
        }
    });
}, RATE_LIMIT_WINDOW);
