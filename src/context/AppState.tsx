import React, { ReactNode } from "react"
import Context from "./Context";

interface StateProps {
    children: ReactNode;
}

const AppState: React.FC<StateProps> = ({ children }) => {

    const test = () => {
        console.log("Hello");
    }

    return (
        <Context.Provider value={{
            test
        }
        }>
            {children}
        </Context.Provider>
    )
}

export default AppState;