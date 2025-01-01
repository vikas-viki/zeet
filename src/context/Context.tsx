import { createContext, useContext } from "react";

export interface State {
    test: () => void;
    createSpace: (name: string) => void;
    getUniqueId: (username: string, email: string, password: string) => string;
    getHash: (data: string) => string;
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