import React from "react";
import { SocketContext } from "./Contexts";
import { StateProps } from "../types/StateTypes";
import { io } from "socket.io-client";
import { SERVER_URL } from "./AppState";
import { constants } from "../helpers/constants";

export const socket = io(SERVER_URL);
const SocketState: React.FC<StateProps> = ({ children }) => {   
    const [joinedRoom, setJoinedRoom] = React.useState<boolean>(false);
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



    return (
        <SocketContext.Provider value={{
            socket,
            joinedRoom,
            setJoinedRoom
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketState;