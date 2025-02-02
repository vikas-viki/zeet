import React, { useCallback, useEffect, useRef } from "react";
import { SocketContext, useAppContext } from "./Contexts";
import { ConsumerStreams, ConsumerTransport, OtherUsers, ProducerTransport, RoomChat, RoomUsers, StateProps } from "../types/StateTypes";
import { io } from "socket.io-client";
import { SERVER_URL } from "./AppState";
import { constants } from "../helpers/constants";
import * as mediaSoupClient from "mediasoup-client";
import { DtlsParameters, RtpCapabilities, RtpParameters } from "mediasoup-client/lib/types";
import toast from "react-hot-toast";

export const socket = io(SERVER_URL);
const SocketState: React.FC<StateProps> = ({ children }) => {
    const [joinedRoom, setJoinedRoom] = React.useState<boolean>(false);
    const [joinedSpace, setJoinedSpace] = React.useState<boolean>(false);
    const [roomUsers, setRoomUsers] = React.useState<RoomUsers>({});
    const [roomMessages, setRoomMessages] = React.useState<RoomChat>([]);
    const [micOn, setMicOn] = React.useState<boolean>(false);
    const [videoOn, setVideoOn] = React.useState<boolean>(false);
    const [producerTransport, setProducerTransport] = React.useState<mediaSoupClient.types.Transport | null>(null);
    const [audioProducer, setAudioProducer] = React.useState<mediaSoupClient.types.Producer | null>(null);
    const [videoProducer, setVideoProducer] = React.useState<mediaSoupClient.types.Producer | null>(null);
    const [consumerTransport, setConsumerTransport] = React.useState<mediaSoupClient.types.Transport | null>(null);
    const [consumerStreams, setConsumerStreams] = React.useState<ConsumerStreams>({});
    const [mediaSoupDevice, setMediaSoupDevice] = React.useState<mediaSoupClient.Device>(new mediaSoupClient.Device());
    const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);

    const { userName, userId } = useAppContext();
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
                color: getRandomColor(),
                audioProducerId: null,
                videoProducerId: null,
                audioPaused: true,
                videoPaused: true
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
                        color: getRandomColor(),
                        audioProducerId: null,
                        videoProducerId: null,
                        audioPaused: true,
                        videoPaused: true
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
        // webRTC handling

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

        socket.on(constants.mediaSoup.userProducing, (data: { userId: string, kind: "audio" | "video", producerId: string }) => {
            console.log("producing", data);

            setRoomUsers(prev => {
                prev[data.userId] = {
                    ...prev[data.userId],
                    [data.kind === "audio" ? "audioProducerId" : "videoProducerId"]: data.producerId,
                    [data.kind === "audio" ? "audioPaused" : "videoPaused"]: false
                }
                return { ...prev };
            });
        })

        socket.on(constants.mediaSoup.userPausing, (data: { userId: string, kind: "audio" | "video" }) => {
            console.log("stopping", data);

            setRoomUsers(prev => {
                prev[data.userId] = {
                    ...prev[data.userId],
                    [data.kind === "audio" ? "audioPaused" : "videoPaused"]: true
                }
                return { ...prev };
            });
        })
        return () => {
            socket.off("connect");
        }
    }, []);

    const startProducingMedia = useCallback(async (kind: "audio" | "video") => {
        try {
            if (!mediaSoupDevice) return;
            if (!mediaSoupDevice.loaded) {
                console.log("Loading mediaSoupDevice...");
                await new Promise<void>((resolve) => {
                    socket.emit(constants.mediaSoup.getRouterRtpCapabilities, {}, async (rtpCapabilities: RtpCapabilities) => {
                        await mediaSoupDevice.load({ routerRtpCapabilities: rtpCapabilities });
                        console.log("mediaSoupDevice loaded successfully.");
                        resolve();
                    });
                });
            }
            const roomId = window.localStorage.getItem("spaceId") + constants.spaceRooms.room1;
            const constraints = kind === "audio" ? { audio: true } : { video: true };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);

            let _producerTransport = producerTransport;
            let producerId: string = "";

            if (!_producerTransport) {
                _producerTransport = await new Promise((resolve) => {
                    socket.emit(constants.mediaSoup.createTransport,
                        { userId, roomId, produce: true },
                        (transportInfo: mediaSoupClient.types.TransportOptions) => {
                            console.log({ mediaSoupDevice });
                            const transport = mediaSoupDevice.createSendTransport(transportInfo);
                            setProducerTransport(transport);

                            transport.on("connect", ({ dtlsParameters }, callback) => {
                                socket.emit(constants.mediaSoup.connectTransport, {
                                    userId,
                                    roomId,
                                    transportId: transport.id,
                                    dtlsParameters,
                                    produce: true
                                }, callback);
                            });

                            transport.on("produce", ({ kind, rtpParameters }, callback) => {
                                socket.emit(constants.mediaSoup.produce, { userId, roomId, kind, rtpParameters }, (_producerId: string) => {
                                    console.log({ _producerId })
                                    producerId = _producerId;
                                    callback({ id: _producerId });
                                });
                            });
                            resolve(transport);
                        }
                    );
                });
            }

            const track = stream.getTracks()[0];

            if (!track) {
                console.error(`No ${kind} track found.`);
                return;
            }

            let producer = kind === "audio" ? audioProducer : videoProducer;

            if (producer) {
                console.log(`Resuming ${kind} producer`);
                producer.resume();

                await producer.replaceTrack({ track: stream.getTracks()[0] });

                console.log(`${kind} track stopped`);

            } else {
                console.log({ _producerTransport })
                await _producerTransport!.produce({
                    track,
                    encodings: [{ maxBitrate: 100_000 }],
                    disableTrackOnPause: kind === "audio",
                }).then(producer => {
                    console.log("creating ", { producer });
                    if (kind === "audio") setAudioProducer(producer);
                    else setVideoProducer(producer);
                }).catch(console.log)
            }

            socket.emit(constants.mediaSoup.userProducing, { userId, roomId, kind, producerId });
        } catch (e) {
            console.error({ error: e });
            toast.error("An error occurred!");
        }
    }, [userId, mediaSoupDevice, producerTransport, audioProducer, videoProducer]);

    const stopProducingMedia = useCallback(async (kind: "audio" | "video") => {
        const producer = kind === "audio" ? audioProducer : videoProducer;

        if (producer) {
            producer.pause();
            console.log(`${kind} producer paused`, producer.track);

            await producer.replaceTrack({ track: null });

            socket.emit(constants.mediaSoup.userPausing, { userId, kind, roomId: window.localStorage.getItem("spaceId") + constants.spaceRooms.room1 });
        } else {
            console.error("Producer does not exist!");
        }
    }, [audioProducer, videoProducer]);

    const startConsumingMedia = useCallback((producerId: string, produceUserId: string) => {
        const roomId = window.localStorage.getItem("spaceId") + constants.spaceRooms.room1;
        socket.emit(constants.mediaSoup.createTransport, { userId, produce: false, roomId }, async (transportInfo: any) => {
            var transport = consumerTransport;
            if (!transport) {
                transport = mediaSoupDevice!.createRecvTransport(transportInfo);
                setConsumerTransport(transport);
            }

            transport.on("connect", (args: { dtlsParameters: DtlsParameters }, callback: CallableFunction) => {
                socket.emit(constants.mediaSoup.connectTransport, { dtlsParameters: args.dtlsParameters, userId, produce: false, roomId }, callback);
            });

            socket.emit(constants.mediaSoup.consume, { rtpCapabilities: mediaSoupDevice?.rtpCapabilities, producerId, userId, roomId }, async (consumerInfo: { id: string, kind: "audio" | "video", rtpParameters: RtpParameters }) => {
                const consumer = await transport!.consume(consumerInfo);
                consumer.resume();
                setConsumerStreams(prev => {
                    const newStream = new MediaStream();
                    newStream.addTrack(consumer.track);
                    prev[produceUserId] = {
                        ...prev[produceUserId],
                        [consumerInfo.kind]: newStream
                    };
                    return { ...prev }
                })
            })
        })
    }, [consumerTransport, mediaSoupDevice, userId]);

    const stopConsumingMedia = useCallback((produceUserId: string, kind: "audio" | "video") => {
        if (!consumerStreams[produceUserId]) return;
        const stream = consumerStreams[produceUserId][kind];
        stream?.getTracks().forEach(track => track.stop());

        setConsumerStreams(prev => {
            delete prev[produceUserId][kind];
            return { ...prev };
        })

    }, [consumerStreams]);

    return (
        <SocketContext.Provider value={{
            socket,
            joinedRoom,
            setJoinedRoom,
            joinedSpace,
            setJoinedSpace,
            roomUsers,
            sendMessage,
            roomMessages,
            micOn,
            setMicOn,
            videoOn,
            setVideoOn,
            startProducingMedia,
            stopProducingMedia,
            startConsumingMedia,
            stopConsumingMedia,
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketState;