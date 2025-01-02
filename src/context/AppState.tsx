import React from "react"
import Context from "./Context";
import { Spaces, StateProps, UserSpaces, UserSpacesResponse } from "../types/StateTypes";
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
    const [userSpaces, setUserSpaces] = React.useState<UserSpaces>([]);
    const [spaces, setSpaces] = React.useState<Spaces>([]);

    const createSpace = async (name: string, toggleModel: CallableFunction) => {
        try {
            const response = await axios.post(`${SERVER_URL}/create-space`, {
                userId,
                spaceId: 1,
                spaceName: name
            }, { withCredentials: true });
            if (response.status == 200 && response.data.message === "SUCCESS") {
                await getUserSpaces();
                toggleModel();
                toast.success("Space created.");
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

    const getUserSpaces = async () => {
        try {
            var _spaces;
            if (spaces.length == 0)
                _spaces = await getSpaceDetails();
            else
                _spaces = spaces;

            const response = await axios.post(`${SERVER_URL}/get-user-spaces`,
                { userId },
                { withCredentials: true });

            if (response.data.message === "NO_SPACE_FOUND") {
                console.log("No space found!");
            } else {
                const _userSpaces: UserSpacesResponse = response.data.userSpaces;
                var user_spaces = [];
                for (let i = 0; i < _userSpaces.length; i++) {
                    let _space = _spaces.filter(e => e.spaceid == _userSpaces[i].spaceid)[0];
                    user_spaces.push({
                        spaceimage: _space.spaceimage,
                        spaceid: _userSpaces[i].spaceid,
                        spacename: _userSpaces[i].spacename
                    });
                }
                setUserSpaces(user_spaces);
            }
        } catch (e: any) {
            console.log(e);
            const message = e?.response?.data?.message;
            if (message === "ERROR") {
                toast.error("Error fetching spaces!");
            } else if (message === "DUPLICATE_SPACE") {
                toast.error("Duplicate space!");
            }
        }
    }

    const getSpaceDetails = async (): Promise<Spaces> => {
        try {
            const response = await axios.post(`${SERVER_URL}/get-spaces`, { userId }, { withCredentials: true });
            setSpaces(response.data.spaces);
            return response.data.spaces;
        } catch (e) {
            console.log(e);
        }
        return [];
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
            setUserId,
            getUserSpaces,
            userSpaces
        }
        }>
            {children}
        </Context.Provider>
    )
}

export default AppState;