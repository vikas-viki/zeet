import Phaser from "phaser";
import { useEffect, useRef } from "react";
import { GameScene } from "./Phaser";

const Space = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameRef.current) {
            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                pixelArt: true,
                width: 960,
                height: 640,
                scene: [GameScene],
                physics: {
                    default: "arcade",
                    arcade: { debug: true },
                },
            };

            gameRef.current = new Phaser.Game(config);
        }
    }, []);

    return (
        <h1>Hello again</h1>
    )
}
export default Space;