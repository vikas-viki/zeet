import { createContext } from "react";

export interface State {
    test: () => void;
}

const Context = createContext<State | undefined>(undefined);

export default Context;