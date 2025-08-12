/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect } from "react";
import { SocketContext, useAppContext } from "./Contexts";
import { Consumers, ConsumerStreams, OtherUsers, RoomChat, RoomStreams, RoomUsers, StateProps } from "../types/StateTypes";
import { constants, socket } from "../helpers/constants";
import * as mediaSoupClient from "mediasoup-client";
import { DtlsParameters, RtpCapabilities, RtpParameters } from "mediasoup-client/lib/types";
import toast from "react-hot-toast";


const SocketState: React.FC<StateProps> = ({ children }) => {
    const [joinedRoom, setJoinedRoom] = React.useState<boolean>(false);
    const [joinedSpace, setJoinedSpace] = React.useState<boolean>(false);
    const [roomUsers, setRoomUsers] = React.useState<RoomUsers>({});
    const [roomMessages, setRoomMessages] = React.useState<RoomChat>([]);
    const [micOn, setMicOn] = React.useState<boolean>(false);
    const [videoOn, setVideoOn] = React.useState<boolean>(false);
    const audioProducer = React.useRef<mediaSoupClient.types.Producer | null>(null);
    const videoProducer = React.useRef<mediaSoupClient.types.Producer | null>(null);
    const consumers = React.useRef<Consumers>({});
    const producerTransport = React.useRef<mediaSoupClient.types.Transport | null>(null);
    const consumerTransport = React.useRef<mediaSoupClient.types.Transport | null>(null);
    const [consumerStreams, setConsumerStreams] = React.useState<ConsumerStreams>({});
    const [mediaSoupDevice, setMediaSoupDevice] = React.useState<mediaSoupClient.Device>(new mediaSoupClient.Device());
    const mediaSoupDeviceRef = React.useRef<mediaSoupClient.Device>(mediaSoupDevice);
    const [connectedSockets, setConnectedSockets] = React.useState<number>(0);

    // keep ref in sync so callbacks see current Device
    useEffect(() => {
        mediaSoupDeviceRef.current = mediaSoupDevice;
    }, [mediaSoupDevice]);

    const { userName, userId } = useAppContext();

    // Utility: safe push new chat message (no duplicates)
    const newMessage = useCallback((data: { userName: string, text: string, time: string }) => {
        setRoomMessages(prev => {
            const exists = prev.some(message => message.userName === data.userName && message.text === data.text && message.time === data.time);
            if (!exists) {
                return [...prev, data];
            }
            return prev;
        });
    }, []);

    const sendMessage = useCallback((text: string) => {
        const timeParts = new Date().toLocaleTimeString().split(" ");
        const time = timeParts.length >= 2 ? (timeParts[0].slice(0, 5) + timeParts[1]) : timeParts[0].slice(0, 5);
        newMessage({ userName, text, time });
        socket.emit(constants.client.message, {
            userName,
            text,
            spaceId: window.localStorage.getItem("spaceId") + constants.spaceRooms.room1,
        });
    }, [userName, newMessage]);

    const socket_newMessageHandler = useCallback((data: { userName: string, text: string, time?: string }) => {
        const timeParts = new Date().toLocaleTimeString().split(" ");
        const time = timeParts.length >= 2 ? (timeParts[0].slice(0, 5) + timeParts[1]) : timeParts[0].slice(0, 5);
        newMessage({ userName: data.userName, text: data.text, time });
    }, [newMessage]);

    const getRandomColor = useCallback(() => {
        return Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255);
    }, []);

    // Handlers that update state safely (no mutation)
    const socket_joinRoomHandler = useCallback((data: { userId: string, roomId: string, userName: string }) => {
        setRoomUsers(prev => {
            if (data.userId && data.userId.toString() !== "") {
                // create new object copy
                return {
                    ...prev,
                    [data.userId.toString()]: {
                        userName: data.userName,
                        color: getRandomColor(),
                        audioProducerId: null,
                        videoProducerId: null,
                        audioPaused: true,
                        videoPaused: true
                    }
                };
            }
            return prev;
        });
    }, [getRandomColor]);

    const socket_leaveRoomHandler = useCallback((data: { userId: string }) => {
        setRoomUsers(prev => {
            const copy = { ...prev };
            delete copy[data.userId];
            return copy;
        });
    }, []);

    // NOTE: when a user joins we get users + streams snapshot
    const socket_roomUsersHandler = useCallback((data: { users: OtherUsers, streams: RoomStreams }) => {
        setRoomUsers(prev => {
            const copy = { ...prev };

            for (const key in data.users) {
                if (!copy[key] && key !== "" && key !== userId) {
                    copy[key] = {
                        userName: data.users[key],
                        color: getRandomColor(),
                        audioProducerId: null,
                        videoProducerId: null,
                        audioPaused: true,
                        videoPaused: true
                    };
                }
            }

            for (const streamUserId in data.streams) {
                const streamInfo = data.streams[streamUserId];
                // audio
                if (streamInfo.audio) {
                    if (!copy[streamUserId]) {
                        copy[streamUserId] = {
                            userName: data.users[streamUserId] || "-",
                            color: getRandomColor(),
                            audioProducerId: streamInfo.producerId,
                            videoProducerId: null,
                            audioPaused: false,
                            videoPaused: true
                        };
                    } else {
                        copy[streamUserId] = {
                            ...copy[streamUserId],
                            audioProducerId: streamInfo.producerId,
                            audioPaused: false
                        };
                    }
                    // start consuming audio (fire-and-forget)
                    startConsumingMedia(streamInfo.producerId, streamUserId).catch(err => console.warn("consume audio failed", err));
                }
                // video
                if (streamInfo.video) {
                    if (!copy[streamUserId]) {
                        copy[streamUserId] = {
                            userName: data.users[streamUserId] || "-",
                            color: getRandomColor(),
                            audioProducerId: null,
                            videoProducerId: streamInfo.producerId,
                            audioPaused: true,
                            videoPaused: false
                        };
                    } else {
                        copy[streamUserId] = {
                            ...copy[streamUserId],
                            videoProducerId: streamInfo.producerId,
                            videoPaused: false
                        };
                    }
                    // start consuming video (fire-and-forget)
                    startConsumingMedia(streamInfo.producerId, streamUserId).catch(err => console.warn("consume video failed", err));
                }
            }

            return copy;
        });
    }, [getRandomColor, userId]);

    // set up socket listeners in useEffect and clean up on unmount
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

    // other socket handlers (no duplicates), and mediasoup user producing / pausing
    useEffect(() => {
        const handleUserProducing = (data: { userId: string, kind: "audio" | "video", producerId: string }) => {
            // start consume and update state
            startConsumingMedia(data.producerId, data.userId).catch(err => console.warn("consume failed", err));

            setRoomUsers(prev => {
                const copy = { ...prev };
                copy[data.userId] = {
                    ...copy[data.userId],
                    [data.kind === "audio" ? "audioProducerId" : "videoProducerId"]: data.producerId,
                    [data.kind === "audio" ? "audioPaused" : "videoPaused"]: false
                };
                return copy;
            });
        };

        const handleUserPauseProducing = (data: { userId: string, kind: "audio" | "video" }) => {
            setRoomUsers(prev => {
                const copy = { ...prev };
                if (!copy[data.userId]) return copy;
                copy[data.userId] = {
                    ...copy[data.userId],
                    [data.kind === "audio" ? "audioPaused" : "videoPaused"]: true
                };
                return copy;
            });
        };

        socket.on(constants.mediaSoup.userProducing, handleUserProducing);
        socket.on(constants.mediaSoup.userPauseProducing, handleUserPauseProducing);

        return () => {
            socket.off(constants.mediaSoup.userProducing, handleUserProducing);
            socket.off(constants.mediaSoup.userPauseProducing, handleUserPauseProducing);
        };
    }, []);

    useEffect(() => {
        const handleConnect = () => {
            console.log("Socket connected!");
            document.title = socket.id || document.title;
        };

        const handleNoOfClients = (data: { count: number }) => {
            setConnectedSockets(data.count);
        };

        socket.on("connect", handleConnect);
        socket.on(constants.server.noOfClients, handleNoOfClients);

        return () => {
            socket.off("connect", handleConnect);
            socket.off(constants.server.noOfClients, handleNoOfClients);
        };
    }, []);

    const loadMediaSoupDevice = useCallback(async () => {
        const _device = mediaSoupDeviceRef.current;
        if (!_device) return;
        if (!_device.loaded) {
            await new Promise<void>((resolve, reject) => {
                socket.emit(constants.mediaSoup.getRouterRtpCapabilities, {}, async (rtpCapabilities: RtpCapabilities | { error?: string }) => {
                    if (!rtpCapabilities || (rtpCapabilities as any).error) {
                        return reject(new Error("Failed to get rtpCapabilities"));
                    }
                    try {
                        await _device.load({ routerRtpCapabilities: rtpCapabilities as RtpCapabilities });
                        setMediaSoupDevice(_device);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        }
    }, []);

    const startProducingMedia = useCallback(async (kind: "audio" | "video", deviceId: string) => {
        try {
            await loadMediaSoupDevice();
            const roomId = window.localStorage.getItem("spaceId") + constants.spaceRooms.room1;
            let stream: MediaStream | undefined;
            if (deviceId && deviceId !== "default") {
                stream = await navigator.mediaDevices.getUserMedia({ [kind]: { deviceId: { exact: deviceId } } } as any);
            } else {
                stream = await navigator.mediaDevices.getUserMedia({ [kind]: true } as any);
            }

            if (!stream) throw new Error("No media stream obtained");
            const track = stream.getTracks()[0];
            if (!track) throw new Error(`No ${kind} track found.`);

            let _producerTransport = producerTransport.current;

            if (!_producerTransport) {
                _producerTransport = await new Promise<mediaSoupClient.types.Transport>((resolve, reject) => {
                    socket.emit(constants.mediaSoup.createTransport,
                        { userId, roomId, produce: true },
                        (transportInfo: any) => {
                            try {
                                const transport = mediaSoupDeviceRef.current.createSendTransport(transportInfo);
                                producerTransport.current = transport;

                                transport.on("connect", ({ dtlsParameters }, callback) => {
                                    socket.emit(constants.mediaSoup.connectTransport, {
                                        userId,
                                        roomId,
                                        dtlsParameters,
                                        produce: true
                                    }, callback);
                                });

                                transport.on("produce", ({ kind, rtpParameters }, callback) => {
                                    socket.emit(constants.mediaSoup.produce, { userId, roomId, kind, rtpParameters }, (_producerId: string) => {
                                        callback({ id: _producerId });
                                    });
                                });

                                resolve(transport);
                            } catch (err) {
                                reject(err);
                            }
                        }
                    );
                });
            }

            const producer = kind === "audio" ? audioProducer.current : videoProducer.current;
            let producerId: any;

            if (producer) {
                // replace track and resume
                await producer.replaceTrack({ track } as any);
                await producer.resume();
                producerId = producer.id;
            } else {
                const createdProducer = await _producerTransport!.produce({
                    track,
                    encodings: [{ maxBitrate: 100_000 }],
                    disableTrackOnPause: kind === "audio",
                } as any);

                producerId = createdProducer.id;
                if (kind === "audio") audioProducer.current = createdProducer;
                else videoProducer.current = createdProducer;
            }

            socket.emit(constants.mediaSoup.userProducing, { userId, roomId, kind, producerId });
        } catch (e) {
            console.error({ error: e });
            toast.error("An error occurred while starting media!");
        }
    }, [userId, loadMediaSoupDevice]);

    const stopProducingMedia = useCallback(async (kind: "audio" | "video") => {
        const producer = kind === "audio" ? audioProducer.current : videoProducer.current;

        if (producer) {
            try {
                // pause and replace track with null
                await producer.pause();
                await producer.replaceTrack({ track: null } as any);
                socket.emit(constants.mediaSoup.userPauseProducing, {
                    userId,
                    roomId: window.localStorage.getItem("spaceId") + constants.spaceRooms.room1,
                    kind,
                    producerId: producer.id
                });
            } catch (err) {
                console.warn("stopProducingMedia failed", err);
            }
        } else {
            console.error("Producer does not exist!");
        }
    }, [userId]);

    const startConsumingMedia = useCallback(async (producerId: string, produceUserId: string) => {
        try {
            const roomId = window.localStorage.getItem("spaceId") + constants.spaceRooms.room1;
            await loadMediaSoupDevice();

            let _consumerTransport = consumerTransport.current;

            if (!_consumerTransport) {
                _consumerTransport = await new Promise<mediaSoupClient.types.Transport>((resolve, reject) => {
                    socket.emit(constants.mediaSoup.createTransport, { userId, produce: false, roomId }, (transportInfo: any) => {
                        try {
                            const transport = mediaSoupDeviceRef.current.createRecvTransport(transportInfo);
                            consumerTransport.current = transport;

                            transport.on("connect", (args: { dtlsParameters: DtlsParameters }, callback: CallableFunction) => {
                                socket.emit(constants.mediaSoup.connectTransport, { dtlsParameters: args.dtlsParameters, userId, produce: false, roomId }, callback);
                            });

                            resolve(transport);
                        } catch (err) {
                            reject(err);
                        }
                    });
                });
            }

            // check if we already have a consumer for this producer
            const existingConsumer = consumers.current[producerId];
            const consumerId = existingConsumer ? existingConsumer.id : "-";

            socket.emit(constants.mediaSoup.consume, {
                rtpCapabilities: mediaSoupDeviceRef.current.rtpCapabilities,
                producerId,
                userId,
                roomId,
                consumerId,
                produceUserId
            }, async (consumerInfo: { id: string, kind: "audio" | "video", rtpParameters: RtpParameters, producerId: string }, userName: string | undefined | null) => {
                let _consumer = consumers.current[producerId];
                const newStream = new MediaStream();

                if (!_consumer) {
                    _consumer = await consumerTransport.current!.consume(consumerInfo);
                    consumers.current[producerId] = _consumer;
                    newStream.addTrack(_consumer.track);

                    const elementId = (userName || produceUserId) + "_" + consumerInfo.kind;
                    const element = document.getElementById(elementId) as HTMLMediaElement | null;

                    if (element) {
                        element.srcObject = newStream;
                        element.autoplay = true;
                        element.controls = false;
                        element.parentElement?.classList.remove("room_user_bg");
                        try { await element.play(); } catch { /* auto-play might be blocked */ }
                    }
                } else {
                    try {
                        await _consumer.resume();
                        const el = document.getElementById(_consumer.id) as HTMLMediaElement | null;
                        if (el) await el.play();
                    } catch (err) { console.warn("resume consumer play failed", err); }
                }

                setConsumerStreams(prev => {
                    const copy = { ...prev };
                    copy[produceUserId] = {
                        ...copy[produceUserId],
                        [consumerInfo.kind]: newStream
                    };
                    return copy;
                });
            });
        } catch (err) {
            console.error("startConsumingMedia error:", err);
        }
    }, [userId, loadMediaSoupDevice]);

    const stopConsumingMedia = useCallback((produceUserId: string, kind: "audio" | "video") => {
        setConsumerStreams(prev => {
            const copy = { ...prev };
            if (!copy[produceUserId]) return copy;
            const stream = copy[produceUserId][kind];
            stream?.getTracks().forEach(track => track.stop());
            // remove that kind
            const newUserStreams = { ...copy[produceUserId] };
            delete newUserStreams[kind];
            copy[produceUserId] = newUserStreams;
            return copy;
        });
    }, []);

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
            consumerStreams,
            connectedSockets
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketState;
