import React from "react"
import Context from "./Context";
import { useNavigate } from "react-router-dom";
import { StateProps } from "../types/StateTypes";
import CryptoJS from 'crypto-js';
import axios from "axios";
import toast from "react-hot-toast";

const test = () => {
    console.log("Hello");
}

const SALT = import.meta.env.VITE_SALT;
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const AppState: React.FC<StateProps> = ({ children }) => {
    const [userId, setUserId] = React.useState<string>('');
    const [userSpaces, setUserSpaces] = React.useState(null);

    const createSpace = async (name: string, toggleModel: CallableFunction) => {
        try {
            const response = await axios.post(`${SERVER_URL}/create-space`, {
                userId,
                spaceId: 1,
                spaceName: name
            }, { withCredentials: true });
            if (response.status == 200 && response.data.message === "SUCCESS") {
                toast.success("Space created.");
                toggleModel();
            }
        } catch (e: any) {
            const message = e.response.data.message;
            if (message === "ERROR") {
                toast.error("Error creating space!");
            } else if (message === "DUPLICATE_SPACE") {
                toast.error("Duplicate space!");
            }
        }
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
            getHash,
            userId,
            setUserId
        }
        }>
            {children}
        </Context.Provider>
    )
}

export default AppState;