import { createContext } from "react";
import { FormData } from "../types/StateTypes";

export interface State {
    test: () => void;
    createSpace: (name: string) => void;
    formData: FormData;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const Context = createContext<State | undefined>(undefined);

export default Context;