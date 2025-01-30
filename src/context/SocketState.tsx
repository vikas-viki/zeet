import React, { useCallback, useEffect } from "react";
import { SocketContext, useAppContext } from "./Contexts";
import { OtherUsers, RoomChat, RoomUsers, StateProps } from "../types/StateTypes";
import { io } from "socket.io-client";
import { SERVER_URL } from "./AppState";
import { constants } from "../helpers/constants";

export const socket = io(SERVER_URL);
const SocketState: React.FC<StateProps> = ({ children }) => {
    const [joinedRoom, setJoinedRoom] = React.useState<boolean>(false);
    const [joinedSpace, setJoinedSpace] = React.useState<boolean>(false);
    const [roomUsers, setRoomUsers] = React.useState<RoomUsers>({});
    const [roomMessages, setRoomMessages] = React.useState<RoomChat>([]);

    const { userName } = useAppContext();
    var socketId = '';

    socket.on(constants.server.userJoinedSpace, (data: any) => {
        console.log("User joined! space");
        console.log({ data });
    });

    const newMessage = useCallback((data: { userName: string, text: string, time: string }) => {
        setRoomMessages(prev => {
            if (prev.filter(message => message.userName === data.userName && message.text === data.text && message.time === data.time).length === 0) {
                prev.push(data);
            }
            return [...prev];
        });
    }, []);

    const sendMessage = useCallback((text: string) => {
        const time = new Date().toLocaleTimeString().split(" ");
        console.log(text, time);
        newMessage({ userName, text, time: time[0].slice(0, 5) + time[1] });
        socket.emit(constants.client.message,
            {
                userName,
                text,
                spaceId: window.localStorage.getItem("spaceId") + constants.spaceRooms.room1,
            });
    }, [userName, newMessage]);

    const socket_newMessageHandler = useCallback((data: { userName: string, text: string, time: string }) => {
        console.log("Message received", data);
        const time = new Date().toLocaleTimeString().split(" ");
        newMessage({ userName: data.userName, text: data.text, time: time[0].slice(0, 5) + time[1] });
    }, []);

    const getRandomColor = useCallback(() => {
        return Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255);
    }, []);

    const socket_joinRoomHandler = useCallback((data: { userId: string, roomId: string, userName: string }) => {
        console.log("User joined room", data);
        setRoomUsers(prev => {
            prev[data.userId.toString()] = {
                userName: data.userName,
                color: getRandomColor()
            };
            return { ...prev };
        })
    }, []);

    const socket_leaveRoomHandler = useCallback((data: { userId: string }) => {
        console.log("User left room", data);
        setRoomUsers(prev => {
            delete prev[data.userId];
            return { ...prev };
        });
    }, []);

    const socket_roomUsersHandler = useCallback((data: OtherUsers) => {
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
    }, []);

    useEffect(() => {
        socket.on(constants.server.message, socket_newMessageHandler);
        socket.on(constants.server.userJoinedRoom, socket_joinRoomHandler);
        socket.on(constants.server.userLeftRoom, socket_leaveRoomHandler);
        socket.on(constants.server.roomUsers, socket_roomUsersHandler);

        return () => {
            socket.off(constants.server.message, socket_newMessageHandler);
            socket.off(constants.server.userJoinedRoom, socket_joinRoomHandler);
            socket.off(constants.server.userLeftRoom, socket_leaveRoomHandler);
            socket.off(constants.server.roomUsers, socket_roomUsersHandler);
        };
    }, [socket_newMessageHandler, socket_joinRoomHandler, socket_leaveRoomHandler, socket_roomUsersHandler]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Socket connected!");
            socketId = socket.id || "";
            document.title = socket.id!;
        });
        return () => {
            socket.off("connect");
        }
    }, [])

    return (
        <SocketContext.Provider value={{
            socket,
            joinedRoom,
            setJoinedRoom,
            joinedSpace,
            setJoinedSpace,
            roomUsers,
            sendMessage,
            roomMessages
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketState;