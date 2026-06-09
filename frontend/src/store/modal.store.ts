import { create } from "zustand";

interface ModalState {
    createRoomOpen: boolean;

    setCreateRoomOpen: (open: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
    createRoomOpen: false,

    setCreateRoomOpen: (open) =>
        set({
            createRoomOpen: open,
        }),
}));
