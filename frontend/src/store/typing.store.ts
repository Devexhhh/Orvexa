import { create } from "zustand";

interface TypingState {
    typingUsers: Record<string, string[]>;
    setTypingUsers: (roomId: string, users: string[]) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
    typingUsers: {},

    setTypingUsers: (
        roomId,

        users,
    ) =>
        set((state) => ({
            typingUsers: {
                ...state.typingUsers,

                [roomId]: users,
            },
        })),
}));
