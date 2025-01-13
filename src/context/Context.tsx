import { createContext, useContext } from "react";
import { UserSpaces } from "../types/StateTypes";

export interface State {
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
    joinedSpace: boolean;
    setJoinedSpace: (joined: boolean) => void;
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
}

const Context = createContext<State | undefined>(undefined);

export const useMyContext = (): State => {
    const context = useContext(Context);
    if (!context) {
        throw new Error("useMyContext must be used within a Context.Provider");
    }
    return context;
};

export default Context;