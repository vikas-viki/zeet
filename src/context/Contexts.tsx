import { createContext, useContext } from "react";
import { UserSpaces } from "../types/StateTypes";

interface AppState {
    test: () => void;
    createSpace: (name: string, toggleModel: CallableFunction) => void;
    getUniqueId: (username: string, email: string, password: string) => string;
    getHash: (data: string) => string;
    userId: string;
    setUserId: (userId: string) => void;
    getUserSpaces: () => void;
    userSpaces: UserSpaces;
    deleteSpace: (_spaceId: string) => void;
    editSpace: (_spaceId: string, newSpaceName: string, toggleModel: CallableFunction) => void;
    micOn: boolean;
    setMicOn: (micOn: any) => void;
    videoOn: boolean;
    setVideoOn: (videoOn: any) => void;
    setRoomId: (roomId: string) => void;
    roomId: string;
    updateNickName: (newName: string) => void;
    userName: string;
    setUserName: (name: string) => void;
    updatePassword: (newPassword: string) => void;
    linkSpace: (spaceId: string, toggleModel: CallableFunction) => void;
    unlinkSpace: (spaceId: string) => void;
}

export const AppContext = createContext<AppState | undefined>(undefined);

export const useAppContext = (): AppState => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within a Context.Provider");
    }
    return context;
};

// socket related state

interface SocketState {
    socket: any;
    joinedRoom: boolean;
    setJoinedRoom: (joined: boolean) => void;
    joinedSpace: boolean;
    setJoinedSpace: (joined: boolean) => void;
};

export const SocketContext = createContext<SocketState | undefined>(undefined);

export const useSocketContext = (): SocketState => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocketContext must be used within a Context.Provider");
    }
    return context;
};