import Phaser from "phaser";
import { useEffect, useRef, useState } from "react";
import { GameScene } from "./Phaser";
import { eventBus } from "../helpers/EventBus";
import { Mic, MicOff, PhoneCall, PhoneOff, Video, VideoOff } from "lucide-react";
import { useAppContext, useSocketContext } from "../context/Contexts";
import { useNavigate, useParams } from "react-router-dom";
import { constants } from "../helpers/constants";
import { socket } from "../context/SocketState";

const Space = () => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const [collidingJoin, setcollidingJoin] = useState<boolean>(false);

    const navigate = useNavigate();

    const { micOn, setMicOn, videoOn, setVideoOn, setRoomId, userId, roomId, userSpaces, userName } = useAppContext();
    const { id } = useParams();
    const { joinedRoom, setJoinedRoom } = useSocketContext();

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


        if (
            userId === '' ||
            userSpaces.length == 0
        ) {
            gameRef.current?.destroy(true);
            navigate("/spaces");
        } else {
            console.log("Joining space", window.localStorage.getItem("spaceId"));
            socket.emit(constants.client.joinSpace, { userId, spaceId: id, userName: userName.slice(0, 5) });
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

    socket.on(constants.server.userJoinedSpace, (data) => {
        if (joinedRoom) {
            console.log("User joined space", data);
        }
    });

    socket.on(constants.server.roomUsers, (data) => {
        if (joinedRoom) {
            console.log("room users", data);
        }
    })


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
                            eventBus.emit("JOINED_STAGE", { spaceId: id, userName });
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
                        <button className={`space_mic ${videoOn ? "vid_on" : "vid_off"}`}
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
                                eventBus.emit("LEFT_STAGE");
                            }}
                        > <PhoneOff /> <span>Leave Stage</span>
                        </button>
                    </div>
                }
            </div>
        </div>
    );
};

export default Space;
