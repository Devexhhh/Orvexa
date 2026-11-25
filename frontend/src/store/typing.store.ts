import { create } from "zustand";

interface TypingState {
    //
    // roomId -> userIds currently typing
    //
    typingUsers: Record<string, string[]>;
    setTypingUsers: (roomId: string, users: string[]) => void;
    addTypingUser: (roomId: string, userId: string) => void;
    removeTypingUser: (roomId: string, userId: string) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
    typingUsers: {},

    setTypingUsers: (roomId, users) =>
        set((state) => ({
            typingUsers: {
                ...state.typingUsers,
                [roomId]: users,
            },
        })),

    addTypingUser: (roomId, userId) =>
        set((state) => {
            const current = state.typingUsers[roomId] || [];

            if (current.includes(userId)) {
                return state;
            }

            return {
                typingUsers: {
                    ...state.typingUsers,
                    [roomId]: [...current, userId],
                },
            };
        }),

    removeTypingUser: (roomId, userId) =>
        set((state) => ({
            typingUsers: {
                ...state.typingUsers,
                [roomId]: (state.typingUsers[roomId] || []).filter(
                    (id) => id !== userId,
                ),
            },
        })),
}));
