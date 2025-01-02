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
    deleteSpace: (spaceName: string, spaceId: number) => void;
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