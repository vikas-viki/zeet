import Phaser from "phaser";
import { useEffect, useRef, useState } from "react";
import { GameScene } from "./Phaser";
import { eventBus } from "../helpers/EventBus";
import { Mic, MicOff, PhoneCall, PhoneOff, Video, VideoOff } from "lucide-react";
import { useAppContext } from "../context/Contexts";
import { useNavigate, useParams } from "react-router-dom";
import { constants } from "../helpers/constants";
import { socket } from "../context/SocketState";

const Space = () => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const [joinStage, setJoinStage] = useState<boolean>(false);

    const navigate = useNavigate();

    const { joinedSpace, setJoinedSpace, micOn, setMicOn, videoOn, setVideoOn, setRoomId, userId, roomId, userSpaces } = useAppContext();
    const { id } = useParams();

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

        eventBus.on("JOIN_STAGE", () => {
            console.log("User nearby ");
            if (!joinedSpace)
                setJoinStage(true);
        });

        eventBus.on("LEAVE_STAGE", () => {
            console.log("User left!");
            if (!joinedSpace)
                setJoinStage(false);
        });

        // eventBus.on("JOINED_STAGE", () => {
        //     const room = "ROOM1";
        //     console.log("joining room");
        //     socket.emit(constants.client.joinRoom, { userId, roomId: `${id}.${room}` });
        // })

        if (
            userId === '' ||
            userSpaces.length == 0
        ) {
            gameRef.current?.destroy(true);
            navigate("/spaces");
        } else {
            console.log("Joining space");
            socket.emit(constants.client.joinSpace, { userId, spaceId: id });
        }

    }, [joinedSpace, joinStage, userId, userSpaces]);

    return (
        <div className="space_main" >
            <div ref={gameContainerRef} className="game_container"></div>
            <div className="space_options">
                {
                    joinStage === true &&
                    <button className="space_join_call"
                        onClick={() => {
                            setJoinedSpace(true);
                            setJoinStage(false);
                            eventBus.emit("JOINED_STAGE");
                        }}
                    > <PhoneCall /> <span>Join Stage</span>
                    </button>
                }
                {
                    joinedSpace === true &&
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
                                setJoinStage(false);
                                setJoinedSpace(false);
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
