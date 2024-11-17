import { createContext } from "react";

export interface State {
    test: () => void;
    createSpace: (name: string) => void;
}

const Context = createContext<State | undefined>(undefined);

export default Context;