import React, { ReactNode } from "react"
import Context from "./Context";
import { useNavigate } from "react-router-dom";

interface StateProps {
    children: ReactNode;
}
const test = () => {
    console.log("Hello");
}

const AppState: React.FC<StateProps> = ({ children }) => {
    const navigate = useNavigate();

    const createSpace = (name: string) => {
        navigate(`/space/${123}`);
    }

    return (
        <Context.Provider value={{
            test,
            createSpace
        }
        }>
            {children}
        </Context.Provider>
    )
}

export default AppState;