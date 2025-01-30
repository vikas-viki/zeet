import Phaser from "phaser";
import { useEffect, useRef, useState } from "react";
import { GameScene } from "./Phaser";
import { eventBus } from "../helpers/EventBus";
import { MessageSquareText, Mic, MicOff, PhoneCall, PhoneOff, SendHorizonal, Users, Video, VideoOff } from "lucide-react";
import { useAppContext, useSocketContext } from "../context/Contexts";
import { useNavigate, useParams } from "react-router-dom";
import { constants } from "../helpers/constants";
import { socket } from "../context/SocketState";

const Space = () => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const [collidingJoin, setcollidingJoin] = useState<boolean>(false);
    const [showRoomUsers, setShowRoomUsers] = useState<boolean>(false);
    const [showChat, setShowChat] = useState<boolean>(false);
    const [messageInput, setMessageInput] = useState<string>("");
    const navigate = useNavigate();

    const { micOn, setMicOn, videoOn, setVideoOn, setRoomId, userId, roomId, userSpaces, userName } = useAppContext();
    const { id } = useParams();
    const { joinedRoom, setJoinedRoom, joinedSpace, setJoinedSpace, roomUsers, sendMessage, roomMessages } = useSocketContext();


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

            document.addEventListener("reload", () => {
                gameRef.current?.destroy(true);
            });
            document.addEventListener("resize", () => {
                gameRef.current?.scale.resize(window.innerWidth, window.innerHeight);
            })
        }

        if (
            userId === '' ||
            userSpaces.length == 0
        ) {
            gameRef.current?.destroy(true);
            navigate("/spaces");
        } else {
            if (!joinedSpace) {
                setJoinedSpace(true);
                console.log("Joining space", window.localStorage.getItem("spaceId"));
                socket.emit(constants.client.joinSpace, { userId, spaceId: id, userName: userName.slice(0, 5) });
            }
        }
    }, [joinedRoom, collidingJoin, userId, userSpaces]);

    useEffect(() => {
        setTimeout(() => {
            socket.on(constants.server.playersLocation, (data: { [key: string]: { x: number, y: number, userId: string } }[]) => {
                console.log("other players location 1", data);
                eventBus.emit(constants.server.playersLocation, data);
            })
            socket.emit(constants.client.reqLocation, { spaceId: id })
        }, 2000);
    }, [gameRef.current]);

    useEffect(() => {
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

        return () => {
            socket.emit(constants.client.leaveSpace, { userId, spaceId: id });
        };
    }, []);

    return (
        <div className="space_main" >
            <div ref={gameContainerRef} className="game_container"></div>
            <div className="space_options">
                {
                    collidingJoin === true &&
                    <button className="space_join_call"
                        onClick={() => {
                            setJoinedRoom(true);
                            setcollidingJoin(false);
                            eventBus.emit(constants.events.joinedRoom, { spaceId: id, userName });
                        }}
                    > <PhoneCall /> <span>Join Stage</span>
                    </button>
                }
                {
                    joinedRoom === true &&
                    <div className="space_joined_options">
                        <button className={`space_mic ${micOn ? "mic_on" : "mic_off"}`}
                            onClick={() => {
                                setMicOn((prev: any) => !prev);
                            }}
                        >
                            {
                                micOn ?
                                    <Mic />
                                    :
                                    <MicOff />
                            }
                        </button>
                        <button className={`space_video ${videoOn ? "vid_on" : "vid_off"}`}
                            onClick={() => {
                                setVideoOn((prev: any) => !prev);
                            }}
                        >
                            {
                                videoOn ?
                                    <Video />
                                    :
                                    <VideoOff />
                            }
                        </button>
                        <button className="space_leave_call"
                            id="space_leave_call"
                            onClick={() => {
                                setcollidingJoin(false);
                                setJoinedRoom(false);
                                eventBus.emit(constants.events.leftRoom, { spaceId: id, userName });
                            }}
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
                                {
                                    roomMessages.map((message, i) => {
                                        console.log({message, roomUsers});
                                        return (
                                            <div key={i} className={`space_room_message ${userId === message.userId ? "space_room_message_right" : "space_room_message_left"}`}>
                                                <span className="space_room_chat_user">{roomUsers[message.userId].userName.slice(0, 7)} <span>{message.time}</span></span>
                                                <span className="space_room_message_text">{message.text}</span>
                                            </div>
                                        )
                                    }
                                    )
                                }
                            </div>
                            <div className="space_room_message_input">
                                <input id="space_room_message_input" type="text" placeholder="Send messages here.." value={messageInput} onChange={(e) => {
                                    setMessageInput(e.target.value);
                                }} />
                                <button className="space_room_send_btn"
                                    onClick={() => {
                                        sendMessage(messageInput);
                                        setMessageInput("");
                                    }}
                                >
                                    <SendHorizonal size={17} />
                                </button>
                            </div>
                        </div>
                        <div className={`space_room_users_card ${showRoomUsers ? "visible" : "hide"}`} >
                            <span className="space_room_title">Room Users</span>
                            <div className="space_room_users_list">
                                {
                                    Object.values(roomUsers).map((user, i) => {
                                        return (
                                            <span key={i} title={user.userName} className="space_room_user" style={{ backgroundColor: `rgb(${user.color})` }}>{user.userName.slice(0, 1).toUpperCase()}</span>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default Space;
