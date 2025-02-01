import React, { useCallback, useEffect, useRef } from "react";
import { SocketContext, useAppContext } from "./Contexts";
import { ConsumerStreams, ConsumerTransport, OtherUsers, ProducerTransport, RoomChat, RoomUsers, StateProps } from "../types/StateTypes";
import { io } from "socket.io-client";
import { SERVER_URL } from "./AppState";
import { constants } from "../helpers/constants";
import * as mediaSoupClient from "mediasoup-client";
import { DtlsParameters } from "mediasoup-client/lib/types";
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
    const [consumerTransport, setConsumerTransport] = React.useState<ConsumerTransport>({ audios: [], videos: [] });
    const [consumerStreams, setConsumerStreams] = React.useState<ConsumerStreams>({ audios: [], videos: [] });
    const [mediaSoupDevice, setMediaSoupDevice] = React.useState<mediaSoupClient.Device | null>(null);
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
        return () => {
            socket.off("connect");
        }
    }, [])

    const initMediaSoupClient = useCallback(() => {
        const device = new mediaSoupClient.Device();
        setMediaSoupDevice(device);
    }, []);

    const startProducingMedia = useCallback(async (kind: "audio" | "video") => {
        try {
            if (!mediaSoupDevice) return;
            const roomId = window.localStorage.getItem("spaceId") + constants.spaceRooms.room1;
            const constraints = kind === "audio" ? { audio: true } : { video: true };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);

            let _producerTransport = producerTransport;

            if (!_producerTransport) {
                _producerTransport = await new Promise((resolve) => {
                    socket.emit(constants.mediaSoup.createTransport,
                        { userId, roomId, produce: true },
                        (transportInfo: mediaSoupClient.types.TransportOptions) => {
                            const transport = mediaSoupDevice.createSendTransport(transportInfo);
                            setProducerTransport(transport);
                            resolve(transport);

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
                                socket.emit(constants.mediaSoup.produce, { kind, rtpParameters, userId, roomId }, (producerId: string) => {
                                    callback({ id: producerId });
                                });
                            });
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
            } else {
                console.log(`Creating new ${kind} producer`);
                producer = await _producerTransport!.produce({
                    track,
                    encodings: [{ maxBitrate: 100_000 }],
                    disableTrackOnPause: kind === "audio",
                });

                if (kind === "audio") setAudioProducer(producer);
                else setVideoProducer(producer);
            }
        } catch (e) {
            console.error({ error: e });
            toast.error("An error occurred!");
        }
    }, [mediaSoupDevice, producerTransport, audioProducer, videoProducer]);

    const stopProducingMedia = useCallback(async (kind: "audio" | "video") => {
        const producer = kind === "audio" ? audioProducer : videoProducer;
        if (producer) {
            await producer.pause();
            console.log(`${kind} producer paused`);

            socket.emit(constants.mediaSoup.pauseProducing, { kind, userId, spaceId: window.localStorage.getItem("spaceId") + constants.spaceRooms.room1 });

            const track = producer.track;
            if (track) {
                track.stop();
                console.log(`${kind} track stopped`);
            }
        } else {
            console.error("Producer does not exist!");
        }
    }, [audioProducer, videoProducer]);

    const startConsumingAudio = useCallback((producerId: string) => {
        socket.emit(constants.mediaSoup.createTransport, {}, async (transportInfo: any) => {
            const transport = mediaSoupDevice!.createRecvTransport(transportInfo);
            setConsumerTransport(prev => {
                return { audios: [...prev.audios, transport], videos: prev.videos };
            });



            transport.on("connect", (args: { dtlsParameters: DtlsParameters }, callback: CallableFunction) => {
                socket.emit(constants.mediaSoup.connectTransport, { dtlsParameters: args.dtlsParameters }, callback);
            });

            socket.emit(constants.mediaSoup.consume, { rtpCapabilities: mediaSoupDevice?.rtpCapabilities, producerId }, async (consumerInfo: any) => {
                const consumer = await transport.consume(consumerInfo);
                socket.emit(constants.mediaSoup.resumeConsume, { consumerId: consumer.id });
                setConsumerStreams(prev => {
                    const newStream = new MediaStream();
                    newStream.addTrack(consumer.track);
                    return { audios: [...prev.audios, newStream], videos: prev.videos }
                })
            })
        })
    }, []);

    const startConsumingVideo = useCallback((producerId: string) => {
        socket.emit(constants.mediaSoup.createTransport, {}, async (transportInfo: any) => {
            const transport = mediaSoupDevice!.createRecvTransport(transportInfo);
            setConsumerTransport(prev => {
                return { audios: prev.audios, videos: [...prev.videos, transport] };
            });

            transport.on("connect", (args: { dtlsParameters: DtlsParameters }, callback: CallableFunction) => {
                socket.emit(constants.mediaSoup.connectTransport, { dtlsParameters: args.dtlsParameters }, callback);
            });

            socket.emit(constants.mediaSoup.consume, { rtpCapabilities: mediaSoupDevice?.rtpCapabilities, producerId }, async (consumerInfo: any) => {
                const consumer = await transport.consume(consumerInfo);
                socket.emit(constants.mediaSoup.resumeConsume, { consumerId: consumer.id });

                setConsumerStreams(prev => {
                    const newStream = new MediaStream();
                    newStream.addTrack(consumer.track);
                    return { audios: prev.audios, videos: [...prev.videos, newStream] }
                })
            })
        })
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
            setVideoOn
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketState;