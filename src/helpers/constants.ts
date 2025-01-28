export const constants = {
    client: {
        joinSpace: "1.1",
        joinRoom: "1.2",
        leaveSpace: "1.3",
        leaveRoom: "1.4",
        move: "1.5",
        location: "1.5",
        reqLocation: "1.6"
    },
    server: {
        userJoinedSpace: "2.1",
        userLeftSpace: "2.2",
        userJoinedRoom: "2.3",
        userLeftRoom: "2.4",
        userMoved: "2.5",
        playersLocation: "2.6",
        roomUsers: "2.7"
    },
    events: {
        collidingJoin: "3.1",
        collidingLeave: "3.2",
    }
}