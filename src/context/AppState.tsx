import React from "react"
import Context from "./Context";
import { useNavigate } from "react-router-dom";
import { StateProps } from "../types/StateTypes";
import CryptoJS from 'crypto-js';

const test = () => {
    console.log("Hello");
}

const SALT = import.meta.env.VITE_SALT;

const AppState: React.FC<StateProps> = ({ children }) => {
    const navigate = useNavigate();

    const createSpace = (name: string) => {
        navigate(`/space/${123}`);
    }

    function getUniqueId(username: string, email: string, password: string) {
        const input = `${SALT}_${username}${email}${password}_${SALT}`;
        const hash = CryptoJS.MD5(input).toString(CryptoJS.enc.Hex);
        return hash;
    }

    const getHash = (data: string) => {
        return CryptoJS.MD5(`${SALT}_${data}_${SALT}`).toString(CryptoJS.enc.Hex);
    }

    return (
        <Context.Provider value={{
            test,
            createSpace,
            getUniqueId,
            getHash
        }
        }>
            {children}
        </Context.Provider>
    )
}

export default AppState;