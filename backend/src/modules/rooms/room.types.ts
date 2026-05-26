export interface CreateRoomDTO {
    name: string;
    isGroup?: boolean;
}

export interface JoinRoomDTO {
    roomId: string;
    userId: string;
}
