class PresenceManager {
    private onlineUsers: Map<string, number> = new Map();

    //
    // User connected
    //
    addUser(userId: string) {
        const currentConnections = this.onlineUsers.get(userId) || 0;

        this.onlineUsers.set(
            userId,

            currentConnections + 1,
        );
    }

    //
    // User disconnected
    //
    removeUser(userId: string) {
        const currentConnections = this.onlineUsers.get(userId);

        if (!currentConnections) {
            return;
        }

        if (currentConnections <= 1) {
            this.onlineUsers.delete(userId);

            return;
        }

        this.onlineUsers.set(
            userId,

            currentConnections - 1,
        );
    }

    //
    // Check online status
    //
    isOnline(userId: string) {
        return this.onlineUsers.has(userId);
    }

    //
    // Get all online users
    //
    getOnlineUsers() {
        return Array.from(this.onlineUsers.keys());
    }
}

export const presenceManager = new PresenceManager();
