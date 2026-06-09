import { create } from "zustand";

export interface Message {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    createdAt: string;
    sender?: {
        username: string;
        avatar?: string;
    };
    optimistic?: boolean;
    status?: "sending" | "sent" | "seen" | "failed";
    reactions?: {
        emoji: string;
        users: string[];
    }[];
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    type?: string;
    isEdited?: boolean;
    editedAt?: string;

    isDeleted?: boolean;
    deletedAt?: string;
}

interface MessageState {
    messages: Record<string, Message[]>;
    addMessage: (roomId: string, message: Message) => void;
    setMessages: (roomId: string, messages: Message[]) => void;
    replaceOptimisticMessage: (roomId: string, incomingMessage: Message) => void;
    hasMore: Record<string, boolean>;
    setHasMore: (roomId: string, hasMore: boolean) => void;
    markRoomMessagesSeen: (roomId: string) => void;
    markMessageSeen: (roomId: string, messageId: string) => void;
    prependMessages: (roomId: string, messages: Message[]) => void;
    editMessage: (roomId: string, messageId: string, content: string) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    messages: {},
    addMessage: (roomId, message) =>
        set((state) => {
            const existing = state.messages[roomId] || [];
            const alreadyExists = existing.some(
                (msg) =>
                    msg.id === message.id ||
                    (msg.content === message.content &&
                        msg.senderId === message.senderId &&
                        msg.optimistic),
            );
            if (alreadyExists) {
                return state;
            }
            return {
                messages: {
                    ...state.messages,
                    [roomId]: [...existing, message],
                },
            };
        }),

    setMessages: (
        roomId,

        messages,
    ) =>
        set((state) => ({
            messages: {
                ...state.messages,

                [roomId]: messages,
            },
        })),
    replaceOptimisticMessage: (
        roomId,
        incomingMessage,
    ) =>
        set((state) => {
            const existing = state.messages[roomId] || [];

            let replaced = false;

            const updated = existing.map((msg) => {
                const isMatch =
                    msg.optimistic &&
                    msg.senderId === incomingMessage.senderId &&
                    msg.content === incomingMessage.content;

                if (!isMatch) {
                    return msg;
                }

                replaced = true;

                return {
                    ...incomingMessage,
                    optimistic: false,
                    status: "sent",
                };
            });

            console.log("OPTIMISTIC_REPLACED", replaced);

            return {
                messages: {
                    ...state.messages,
                    [roomId]: replaced
                        ? updated
                        : [...existing, incomingMessage],
                },
            };
        }),

    markRoomMessagesSeen: (roomId) =>
        set((state) => ({
            messages: {
                ...state.messages,

                [roomId]: (state.messages[roomId] || []).map((message) => ({
                    ...message,
                    status: message.status === "sent" ? "seen" : message.status,
                })),
            },
        })),
    hasMore: {},

    setHasMore: (
        roomId,

        hasMore,
    ) =>
        set((state) => ({
            hasMore: {
                ...state.hasMore,

                [roomId]: hasMore,
            },
        })),

    prependMessages: (roomId, olderMessages) =>
        set((state) => {
            const existing = state.messages[roomId] || [];

            const ids = new Set(existing.map((m) => m.id));

            const filtered = olderMessages.filter((m) => !ids.has(m.id));

            return {
                messages: {
                    ...state.messages,
                    [roomId]: [...filtered, ...existing],
                },
            };
        }),

    markMessageSeen: (roomId, messageId) =>
        set((state) => ({
            messages: {
                ...state.messages,

                [roomId]: state.messages[roomId]?.map((message) =>
                    message.id === messageId
                        ? {
                            ...message,
                            status: "seen",
                        }
                        : message,
                ),
            },
        })),
    editMessage: (roomId, messageId, content) =>
        set((state) => {
            console.log("UPDATING_MESSAGE", {
                roomId,
                messageId,
                content,
            });

            return {
                messages: {
                    ...state.messages,
                    [roomId]: (state.messages[roomId] || []).map((message) => {
                        console.log(
                            "COMPARE",
                            message.id,
                            messageId,
                        );

                        return message.id === messageId
                            ? {
                                ...message,
                                content,
                                isEdited: true,
                                editedAt: new Date().toISOString(),
                            }
                            : message;
                    }),
                },
            };
        }),
}));
