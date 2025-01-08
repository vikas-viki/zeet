import React, { useEffect } from "react"
import Context from "./Context";
import { Spaces, StateProps, UserSpaces, UserSpacesResponse } from "../types/StateTypes";
import CryptoJS from 'crypto-js';
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { constants } from "../helpers/constants";
import { v4 as uuidv4 } from 'uuid';

const test = () => {
    console.log("Hello");
}

const SALT = import.meta.env.VITE_SALT;
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const socket = io(SERVER_URL);

const AppState: React.FC<StateProps> = ({ children }) => {
    const [userId, setUserId] = React.useState<string>('');
    const [userSpaces, setUserSpaces] = React.useState<UserSpaces>([]);
    const [spaces, setSpaces] = React.useState<Spaces>([]);
    const [joinedSpace, setJoinedSpace] = React.useState<boolean>(false);
    const [micOn, setMicOn] = React.useState<boolean>(false);
    const [videoOn, setVideoOn] = React.useState<boolean>(false);
    const [roomId, setRoomId] = React.useState<string>('');
    var socketId = '';

    const createSpace = async (name: string, toggleModel: CallableFunction) => {
        var _roomId = `${userId}${uuidv4()}`;
        console.log({ _roomId });
        try {
            const response = await axios.post(`${SERVER_URL}/create-space`, {
                userId,
                spaceId: 1,
                spaceName: name,
                roomId: _roomId
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
                    let _space = _spaces.filter(e => e.spaceid == _userSpaces[i].spaceid)[0];
                    user_spaces.push({
                        spaceimage: _space.spaceimage,
                        spaceid: _userSpaces[i].spaceid,
                        spacename: _userSpaces[i].spacename,
                        roomId: _userSpaces[i].roomid
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
            const response = await axios.post(`${SERVER_URL}/get-spaces`, { userId }, { withCredentials: true });
            setSpaces(response.data.spaces);
            return response.data.spaces;
        } catch (e) {
            console.log(e);
        }
        return [];
    }

    const deleteSpace = async (_roomId: string) => {
        try {
            const response = await axios.post(`${SERVER_URL}/delete-space`, {
                roomId: _roomId,
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

    const editSpace = async (_roomId: string, newSpaceName: string, toggleModel: CallableFunction) => {
        try {
            const response = await axios.post(`${SERVER_URL}/edit-space`, {
                roomId: _roomId,
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

    const getHash = (data: string) => {
        return CryptoJS.MD5(`${SALT}_${data}_${SALT}`).toString(CryptoJS.enc.Hex);
    }

    socket.on("connect", () => {
        console.log("Socket connected!");
        socketId = socket.id || "";
    });

    socket.on(constants.server.userJoinedSpace, (data: any) => {
        console.log("User joined! space");
        console.log({ data });
    });

    useEffect(() => {
        console.log("State", { userId, roomId });
        if (userId !== '' && roomId !== '' && window.location.pathname.split("/").length > 2) {
            socket.emit(constants.client.joinSpace, { userId, roomId: userId + roomId });
        }
    }, [roomId, userId]);

    return (
        <Context.Provider value={{
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
            setRoomId
        }
        }>
            {children}
        </Context.Provider>
    )
}

export default AppState;