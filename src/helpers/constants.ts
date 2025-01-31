export const constants = {
    client: {
        joinSpace: "1.1",
        joinRoom: "1.2",
        leaveSpace: "1.3",
        leaveRoom: "1.4",
        move: "1.5",
        location: "1.6",
        reqLocation: "1.7",
        message: "1.8"
    },
    server: {
        userJoinedSpace: "2.1",
        userLeftSpace: "2.2",
        userJoinedRoom: "2.3",
        userLeftRoom: "2.4",
        userMoved: "2.5",
        playersLocation: "2.6",
        roomUsers: "2.7",
        message: "2.8"
    },
    webRTC: {
        offer: "3.1",
        answer: "3.2",
        candidate: "3.3"
    },
    events: {
        collidingJoin: "3.1",
        collidingLeave: "3.2",
        joinedRoom: "3.3",
        leftRoom: "3.4",
    },
    spaceRooms: {
        room1: ".1"
    }
}