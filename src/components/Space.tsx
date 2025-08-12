import Phaser from "phaser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameScene } from "./Phaser";
import { eventBus } from "../helpers/EventBus";
import { ChevronUp, MessageSquareText, Mic, MicOff, PhoneCall, PhoneOff, Users, Video, VideoOff } from "lucide-react";
import { useAppContext, useSocketContext } from "../context/Contexts";
import { useNavigate, useParams } from "react-router-dom";
import { constants, socket } from "../helpers/constants";
import MessageInput from "./MessageInput";
import User from "./User";
import toast from "react-hot-toast";

const Space = () => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const [collidingJoin, setcollidingJoin] = useState<boolean>(false);
    const [showRoomUsers, setShowRoomUsers] = useState<boolean>(false);
    const [showChat, setShowChat] = useState<boolean>(false);
    const mediaDevices = useRef<MediaDeviceInfo[]>([]);
    const navigate = useNavigate();
    const [showMicOptions, setShowMicOptions] = useState<boolean>(false);
    const [showCameraOptions, setShowCameraOptions] = useState<boolean>(false);

    const { setRoomId, userId, userSpaces, userName } = useAppContext();
    const { id } = useParams();
    const { consumerStreams, startProducingMedia, stopProducingMedia, joinedRoom, setJoinedRoom, micOn, setMicOn, videoOn, setVideoOn, joinedSpace, setJoinedSpace, roomUsers, sendMessage, roomMessages } = useSocketContext();


    useEffect(() => {
        setRoomId(id!);

        if (!gameRef.current) {
            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                pixelArt: true,
                width: window.innerWidth,
                height: window.innerHeight,
                parent: gameContainerRef.current,
                scene: [GameScene],
                physics: {
                    default: "arcade",
                    arcade: { debug: true },
                },
            };

            gameRef.current = new Phaser.Game(config);

            const resizeHandler = () => gameRef.current?.scale.resize(window.innerWidth, window.innerHeight);
            document.addEventListener("resize", resizeHandler);
            document.addEventListener("reload", () => gameRef.current?.destroy(true));

            return () => {
                window.removeEventListener("resize", resizeHandler);
            }
        }
    }, []);

    useEffect(() => {
        if (
            userId === '' ||
            userSpaces.length == 0
        ) {
            gameRef.current?.destroy(true);
            navigate("/login");
        } else {
            if (!joinedSpace) {
                setJoinedSpace(true);
                console.log("Joining space", window.localStorage.getItem("spaceId"), userName);
                socket.emit(constants.client.joinSpace, { userId, spaceId: id, userName: userName?.slice(0, 5) });
            }
        }
    }, [userId, userSpaces, userName]);

    useEffect(() => {
        if (gameRef.current) {
            setTimeout(() => {
                socket.on(constants.server.playersLocation, (data: { [key: string]: { x: number, y: number, userId: string } }[]) => {
                    console.log("other players location 1", data);
                    eventBus.emit(constants.server.playersLocation, data);
                })
                socket.emit(constants.client.reqLocation, { spaceId: id })
            }, 1500);
        }

        eventBus.on(constants.events.collidingJoin, () => {
            console.log("User nearby ");
            if (!joinedRoom)
                setcollidingJoin(true);
        });

        eventBus.on(constants.events.collidingLeave, () => {
            console.log("User left!");
            if (!joinedRoom)
                setcollidingJoin(false);
        });

        window.addEventListener("beforeunload", () => {
            socket.emit(constants.client.leaveSpace, { userId, spaceId: id });
        });

        navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
            video: true,
        }).then(stream => {
            stream.getTracks().forEach(track => track.stop());

            navigator.mediaDevices.enumerateDevices().then((_devices) => {
                mediaDevices.current = _devices;
            });
        });

        return () => {
            socket.emit(constants.client.leaveSpace, { userId, spaceId: id });
        };
    }, []);

    const memorisedMessages = useMemo(() => {
        return roomMessages.map((message, i) => {
            console.log({ message, roomUsers });
            return (
                <div key={i} className={`space_room_message ${userName === message.userName ? "space_room_message_right" : "space_room_message_left"}`}>
                    <span className="space_room_chat_user">{message.userName.slice(0, 7)} <span>{message.time}</span></span>
                    <span className="space_room_message_text">{message.text}</span>
                </div>
            )
        })
    }, [roomMessages]);

    const memorisedUsers = useMemo(() => {
        console.log({ roomUsers });
        return Object.values(roomUsers).map((user, i) => {
            return (
                <User  {...user} key={i} />
            )
        })
    }, [joinedRoom, roomUsers, consumerStreams]);

    const joinCallHandler = useCallback(async () => {
        setJoinedRoom(true);
        setcollidingJoin(false);
        eventBus.emit(constants.events.joinedRoom, { spaceId: id, userName });

    }, [userName, id]);

    const leaveCallHandler = useCallback(() => {
        setcollidingJoin(false);
        setJoinedRoom(false);
        eventBus.emit(constants.events.leftRoom, { spaceId: id, userName });
    }, [userName, id]);

    const micOnHandler = useCallback(async () => {
        if (!micOn) {
            startProducingMedia("audio", "default").then(() => {
                setMicOn(true);
                setShowMicOptions(false);
            });
        } else {
            stopProducingMedia("audio");
            setMicOn(false);
        }
    }, [micOn]);

    const cameraOnHandler = useCallback(async () => {
        if (!videoOn) {
            startProducingMedia("video", "default").then(() => {
                setVideoOn(true);
                setShowCameraOptions(false);
            })
        } else {
            stopProducingMedia("video");
            setVideoOn(false);
        }
    }, [videoOn]);

    const selectDeviceHandler = useCallback((deviceId: string, mic: boolean) => {
        if (mic && !micOn) {
            startProducingMedia("audio", deviceId).then(() => {
                setMicOn(true);
                setShowMicOptions(false);
            })
        } else if (!mic && !videoOn) {
            startProducingMedia("video", deviceId).then(() => {
                setVideoOn(true);
                setShowCameraOptions(false);
            })
        }
    }, [micOn]);

    const micOptions = useMemo(() => {
        const inputDevices = mediaDevices.current.filter(device => device.kind === "audioinput");
        const outputDevices = mediaDevices.current.filter(device => device.kind === "audiooutput");

        return (
            <div className={`space_mic_options_container ${showMicOptions ? "options_on" : "options_off"}`}>
                <div className={`space_mic_options input_mic_devices `}>
                    {
                        inputDevices.map((device, i) => {
                            return (
                                <>
                                    {
                                        i == 0 && (
                                            <span>Input Devices</span>
                                        )
                                    }
                                    <button title={device.label} key={i} onClick={() => selectDeviceHandler(device.deviceId, true)}>{
                                        device.label.slice(0, 19) + (device.label.length > 20 ? "..." : "")}</button>
                                </>
                            )
                        })
                    }
                </div>
                <div className={`space_mic_options output_mic_devices `}>
                    {
                        outputDevices.map((device, i) => {
                            return (
                                <>
                                    {
                                        i == 0 && (
                                            <span>Output Devices</span>
                                        )
                                    }
                                    <button title={device.label} key={i} onClick={() => selectDeviceHandler(device.deviceId, true)}>{
                                        device.label.slice(0, 19) + (device.label.length > 20 ? "..." : "")}</button>
                                </>
                            )
                        })
                    }
                </div>
            </div>
        )
    }, [showMicOptions, mediaDevices]);

    const cameraOptions = () => {
        const devices = mediaDevices.current.filter(device => device.kind === "videoinput");

        return (
            <div className={`space_video_options ${showCameraOptions ? "options_on" : "options_off"}`}>
                {
                    devices.map((device, i) => {
                        return (
                            <button title={device.label} key={i} onClick={() => selectDeviceHandler(device.deviceId, false)}>{
                                device.label.slice(0, 20) + (device.label.length > 20 ? "..." : "")}</button>
                        )
                    })
                }
            </div>
        )
    }

    return (
        <div className="space_main" >
            <div ref={gameContainerRef} className="game_container"></div>
            <div className="space_options">
                {
                    collidingJoin === true &&
                    <button className="space_join_call"
                        onClick={joinCallHandler}
                    > <PhoneCall /> <span>Join Stage</span>
                    </button>
                }
                {
                    joinedRoom === true &&
                    <div className="space_joined_options">
                        <div className="">
                            {micOptions}
                            <div className="space_mic_btn">
                                <button className={`space_mic ${micOn ? "mic_on" : "mic_off"}`}
                                    onClick={micOnHandler}
                                >
                                    {
                                        micOn ?
                                            <Mic />
                                            :
                                            <MicOff />
                                    }
                                </button>
                                <button className="mic_options" onClick={() => {
                                    setShowMicOptions(prev => {
                                        if (!prev)
                                            toast.loading("Select an input device", {
                                                duration: 2000
                                            })
                                        return !prev;
                                    });
                                }}>
                                    <ChevronUp size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="space_camera_btn">
                            {cameraOptions()}
                            <div className="space_video_btn">
                                <button className={`space_video ${videoOn ? "vid_on" : "vid_off"}`}
                                    onClick={cameraOnHandler}
                                >
                                    {
                                        videoOn ?
                                            <Video />
                                            :
                                            <VideoOff />
                                    }
                                </button>
                                <button className="mic_options" onClick={() => {
                                    setShowCameraOptions(prev => {
                                        if (!prev)
                                            toast.loading("Select an input device", {
                                                duration: 2000
                                            })
                                        return !prev;
                                    }
                                    );
                                }}>
                                    <ChevronUp size={20} />
                                </button>
                            </div>
                        </div>
                        <button className="space_leave_call"
                            id="space_leave_call"
                            onClick={leaveCallHandler}
                        > <PhoneOff /> <span>Leave Stage</span>
                        </button>
                        <button className="space_room_chat"
                            onClick={() => {
                                setShowChat(prev => !prev);
                            }}
                        >
                            <MessageSquareText />
                        </button>
                        <button className="space_room_users"
                            onClick={() => {
                                setShowRoomUsers((prev: any) => !prev);
                            }}
                        >
                            <Users />
                        </button>
                        <div className={`space_room_chat_card ${showChat ? "visible" : "hide"}`}>
                            <span className="space_room_chat_title">In-Room messages</span>
                            <div className="space_room_message_list">
                                {memorisedMessages}
                            </div>
                            <MessageInput sendMessage={sendMessage} />
                        </div>
                        <div className={`space_room_users_card ${showRoomUsers ? "visible" : "hide"}`} >
                            <span className="space_room_title">Room Users</span>
                            <div className="space_room_users_list">
                                {memorisedUsers}
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div >
    );
};

export default Space;
