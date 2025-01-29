import React from "react";
import { SocketContext } from "./Contexts";
import { OtherUsers, RoomUsers, StateProps } from "../types/StateTypes";
import { io } from "socket.io-client";
import { SERVER_URL } from "./AppState";
import { constants } from "../helpers/constants";

export const socket = io(SERVER_URL);
const SocketState: React.FC<StateProps> = ({ children }) => {
    const [joinedRoom, setJoinedRoom] = React.useState<boolean>(false);
    const [joinedSpace, setJoinedSpace] = React.useState<boolean>(false);
    const [roomUsers, setRoomUsers] = React.useState<RoomUsers>({});
    var socketId = '';

    socket.on("connect", () => {
        console.log("Socket connected!");
        socketId = socket.id || "";
        document.title = socket.id!;
    });

    socket.on(constants.server.userJoinedSpace, (data: any) => {
        console.log("User joined! space");
        console.log({ data });
    });


    const getRandomColor = () => {
        return Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255);
    }

    socket.on(constants.server.userJoinedRoom, (data: { userId: string, roomId: string, userName: string }) => {
        console.log("User joined room", data);
        setRoomUsers(prev => {
            prev[data.userId.toString()] = {
                userName: data.userName,
                color: getRandomColor()
            };
            return { ...prev };
        })
    })

    socket.on(constants.server.userLeftRoom, (data: { userId: string }) => {
        console.log("User left room", data);
        setRoomUsers(prev => {
            delete prev[data.userId];
            return { ...prev };
        });
    })

    socket.on(constants.server.roomUsers, (data: OtherUsers) => {
        console.log("Room users", data);
        setRoomUsers(prev => {
            for (let key in data) {
                if (!prev[key]) {
                    prev[key] = {
                        userName: data[key],
                        color: getRandomColor()
                    }
                }
            }
            return { ...prev };
        })
    })

    return (
        <SocketContext.Provider value={{
            socket,
            joinedRoom,
            setJoinedRoom,
            joinedSpace,
            setJoinedSpace,
            roomUsers
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketState;