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
        message: "2.8",
        noOfClients: "2.9"
    },
    webRTC: {
        offer: "3.1",
        answer: "3.2",
        candidate: "3.3"
    },
    mediaSoup: {
        createTransport: "4.1",
        connectTransport: "4.2",
        produce: "4.3",
        consume: "4.4",
        resumeConsume: "4.5",
        pauseProducing: "4.6",
        getRouterRtpCapabilities: "4.7",
        userProducing: "4.8",
        userPauseProducing: "4.9",
        userPauseConsuming: "4.10",
    },
    events: {
        collidingJoin: "3.1",
        collidingLeave: "3.2",
        joinedRoom: "3.3",
        leftRoom: "3.4",
        messageInputFocused: "3.5",
        messageInputBlurred: "3.6",
    },
    spaceRooms: {
        room1: ".1"
    }
}