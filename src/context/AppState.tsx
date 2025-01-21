import React from "react"
import { AppContext } from "./Contexts";
import { Spaces, StateProps, UserSpaces, UserSpacesResponse } from "../types/StateTypes";
import CryptoJS from 'crypto-js';
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const test = () => {
    console.log("Hello");
}

const SALT = import.meta.env.VITE_SALT;

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const AppState: React.FC<StateProps> = ({ children }) => {
    const [userId, setUserId] = React.useState<string>('');
    const [userName, setUserName] = React.useState<string>('');
    const [userSpaces, setUserSpaces] = React.useState<UserSpaces>([]);
    const [spaces, setSpaces] = React.useState<Spaces>([]);
    const [joinedSpace, setJoinedSpace] = React.useState<boolean>(false);
    const [micOn, setMicOn] = React.useState<boolean>(false);
    const [videoOn, setVideoOn] = React.useState<boolean>(false);
    const [roomId, setRoomId] = React.useState<string>('');

    const navigate = useNavigate();

    const createSpace = async (name: string, toggleModel: CallableFunction) => {
        try {
            const response = await axios.post(`${SERVER_URL}/create-space`, {
                userId,
                spaceName: name,
                mapId: 'f6d3701d-79bb-4b8e-a001-98972ec281fc'
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
                setUserSpaces([]);
                console.log("No space found!");
            } else {
                const _userSpaces: UserSpacesResponse = response.data.userSpaces;

                var user_spaces = [];
                for (let i = 0; i < _userSpaces.length; i++) {
                    let _space = _spaces.filter(e => e.mapid === _userSpaces[i].mapid)[0];
                    user_spaces.push({
                        spaceimage: _space.banner,
                        spaceid: _userSpaces[i].spaceid,
                        spacename: _userSpaces[i].spacename,
                        linked: userId !== _userSpaces[i].ownerid
                    });
                }
                console.log({ user_spaces });
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
            const response = await axios.post(`${SERVER_URL}/get-maps`, { userId }, { withCredentials: true });
            console.log({ spaces: response.data.spaces });
            setSpaces(response.data.spaces);
            return response.data.spaces;
        } catch (e) {
            console.log(e);
        }
        return [];
    }

    const deleteSpace = async (_spaceId: string) => {
        console.log("delete space", { _spaceId });
        try {
            const response = await axios.post(`${SERVER_URL}/delete-space`, {
                spaceId: _spaceId,
                userId
            }, { withCredentials: true });
            if (response.status == 200 && response.data.message === "SUCCESS") {
                await getUserSpaces();
                toast.success("Delete successful.");
            }
        } catch (e: any) {
            if (e?.response?.data.message === "ERROR") {
                toast.error("Error occurred!");
            }
        }
    }

    const editSpace = async (_spaceId: string, newSpaceName: string, toggleModel: CallableFunction) => {
        try {
            const response = await axios.post(`${SERVER_URL}/edit-space`, {
                spaceId: _spaceId,
                newSpaceName,
                userId
            }, { withCredentials: true });
            if (response.status == 200 && response.data.message === "SUCCESS") {
                await getUserSpaces();
                toggleModel();
                toast.success("Edit successful.");
            }
        } catch (e: any) {
            if (e?.response?.data.message === "ERROR") {
                toast.error("Error occurred!");
            }
        }
    }

    function getUniqueId(username: string, email: string, password: string) {
        const input = `${SALT}_${username}${email}${password}_${SALT}`;
        const hash = CryptoJS.MD5(input).toString(CryptoJS.enc.Hex);
        return hash;
    }

    const updateNickName = async (newUsername: string) => {
        try {
            const response = await axios.patch(`${SERVER_URL}/update-username`, {
                userId,
                newUsername
            }, { withCredentials: true });
            if (response.status == 200 && response.data.message === "SUCCESS") {
                toast.success("Nickname updated!");
            } else {
                toast.error("Error updating nickname!");
            }
        } catch (e) {
            console.log(e);
            toast.error("Error occurred!");
        }
    }

    const updatePassword = async (password: string) => {
        try {
            const response = await axios.patch(`${SERVER_URL}/update-password`, {
                userId,
                password: getHash(password)
            }, { withCredentials: true });
            if (response.status == 200 && response.data.message === "SUCCESS") {
                toast.success("Password updated!");
            } else {
                toast.error("Error updating passwprd!");
            }
        } catch (e) {
            console.log(e);
            toast.error("Error occurred!");
        }
    }

    const getHash = (data: string) => {
        return CryptoJS.MD5(`${SALT}_${data}_${SALT}`).toString(CryptoJS.enc.Hex);
    }

    const linkSpace = async (spaceId: string, toggleModel: CallableFunction) => {
        try {
            const response = await axios.post(`${SERVER_URL}/link-space`,
                {
                    userId,
                    spaceId
                },
                { withCredentials: true }
            );

            if (response.status == 200 && response.data.message === "SUCCESS") {
                await getUserSpaces();
                toast.success("Space linked!");
            }
        } catch (e: any) {
            console.log(e.response);
            if (e?.response?.data?.message === "NO_SPACE_FOUND") {
                toast.error("Space not found!");
            } else {
                toast.error("Error linking space!");
            }
        }
        toggleModel();
    }

    const unlinkSpace = async (_spaceId: string) => {
        console.log("unlink space", { _spaceId });
        try {
            const response = await axios.post(`${SERVER_URL}/unlink-space`, {
                spaceId: _spaceId,
                userId
            }, { withCredentials: true });
            if (response.status == 200 && response.data.message === "SUCCESS") {
                await getUserSpaces();
                toast.success("Delete successful.");
            }
        } catch (e: any) {
            if (e?.response?.data.message === "ERROR") {
                toast.error("Error occurred!");
            }
        }
    }

    return (
        <AppContext.Provider value={{
            test,
            createSpace,
            getUniqueId,
            getHash,
            userId,
            setUserId,
            getUserSpaces,
            userSpaces,
            deleteSpace,
            editSpace,
            joinedSpace,
            setJoinedSpace,
            micOn,
            setMicOn,
            videoOn,
            setVideoOn,
            setRoomId,
            roomId,
            updateNickName,
            userName,
            setUserName,
            updatePassword,
            linkSpace,
            unlinkSpace
        }
        }>
            {children}
        </AppContext.Provider>
    )
}

export default AppState;