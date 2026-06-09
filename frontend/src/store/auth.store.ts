import { create } from "zustand";

interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    loading: boolean;

    setToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    loading: true,

    setToken: (token) =>
        set({
            token,
        }),

    setUser: (user) =>
        set({
            user,
        }),

    setLoading: (loading) =>
        set({
            loading,
        }),
}));
