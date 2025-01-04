import Phaser from "phaser";
import { useEffect, useRef, useState } from "react";
import { GameScene } from "./Phaser";
import { eventBus } from "../helpers/EventBus";
import { PhoneCall } from "lucide-react";

const Space = () => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const gameContainerRef = useRef<HTMLDivElement | null>(null);
    const [joinStage, setJoinStage] = useState<boolean>(false);

    useEffect(() => {
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
        }

        eventBus.on("JOIN_STAGE", () => {
            console.log("User nearby");
            setJoinStage(true);
        });

        eventBus.on("LEAVE_STAGE", () => {
            console.log("User left!");
            setJoinStage(false);
        });

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div className="space_main" >
            <div ref={gameContainerRef} className="game_container"></div>
            <div className="space_options">
                {joinStage && <button className="space_join_call"> <PhoneCall /> <span>Join Stage</span></button>}
            </div>
        </div>
    );
};

export default Space;
