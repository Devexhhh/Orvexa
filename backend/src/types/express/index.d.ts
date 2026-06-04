declare namespace Express {

    interface User {
        id: string;
        googleId: string;
        email: string;
        username: string;
        avatar?: string | null;
        createdAt: Date;
        lastSeen?: Date | null;
    }

}