import Phaser from "phaser";
import map from "../map_assets/map.json";
import { useEffect, useRef } from "react";
import walls from "../map_assets/walls.png";
import floors from "../map_assets/floors.png";
import garden from "../map_assets/garden.png";
import playerimg from "../map_assets/player.png";
import pottedplants from "../map_assets/pottedplants.png";
import offiece_pallete from "../map_assets/office_pallete.png";

const Space = () => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const player = useRef<Phaser.Physics.Arcade.Sprite | null>(null);
    var cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;


    useEffect(() => {
        if (!gameRef.current) {
            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: 1000,
                height: 800,
                pixelArt: true,
                scene: {
                    preload,
                    create,
                    update
                },
                physics: {
                    default: "arcade",
                    arcade: {
                        debug: false
                    }
                }
            }
            gameRef.current = new Phaser.Game(config);

            function preload(this: Phaser.Scene) {
                this.load.tilemapTiledJSON("map", map);
                this.load.image("floors", floors);
                this.load.image("garden", garden);
                this.load.image("office_pallete", offiece_pallete);
                this.load.spritesheet("player", playerimg,
                    { frameWidth: 32, frameHeight: 40 }
                );
                this.load.image("pottedplants", pottedplants);
                this.load.image("walls", walls);
            }

            function create(this: Phaser.Scene) {
                const map = this.make.tilemap({ key: "map" });
                // map.setCollision([775]);
                const tileSets = [
                    map.addTilesetImage("floors"),
                    map.addTilesetImage("garden"),
                    map.addTilesetImage("office_pallete"),
                    map.addTilesetImage("pottedplants"),
                    map.addTilesetImage("walls")
                ].filter(tileset => tileset != null);


                const layers = map.layers.map((layer, i) => map.createLayer(i, tileSets));
                layers[1]?.setTint(0xff0000);

                player.current = this.physics.add.sprite(400, 400, "player", 0);

                // if (layers[1] != null)
                //     this.physics.add.collider(player.current, layers[1]);

                this.anims.create({
                    key: 'left',
                    frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });

                this.anims.create({
                    key: 'down',
                    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
                    frameRate: 10,
                    repeat: -1
                });

                this.anims.create({
                    key: 'up',
                    frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
                    frameRate: 10,
                    repeat: -1
                });

                this.anims.create({
                    key: 'right',
                    frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
                    frameRate: 10,
                    repeat: -1
                });
                cursors = this.input.keyboard?.createCursorKeys();
            }

            function update(this: Phaser.Scene) {
                if (cursors && player.current) {
                    player.current.setVelocity(0);

                    if (cursors.left.isDown) {
                        player.current.setVelocityX(-160);
                        player.current.anims.play('left', true);
                    }
                    else if (cursors.right.isDown) {
                        player.current.setVelocityX(160);
                        player.current.anims.play('right', true);
                    }
                    
                    if (cursors.up.isDown) {
                        player.current.setVelocityY(-160);
                        player.current.anims.play('up', true);
                    }
                    else if (cursors.down.isDown) {
                        player.current.setVelocityY(160);
                        player.current.anims.play('down', true);
                    }
            
                    if (
                        !cursors.left.isDown && 
                        !cursors.right.isDown && 
                        !cursors.up.isDown && 
                        !cursors.down.isDown
                    ) {
                        player.current.setVelocity(0);
                        player.current.anims.pause();
                    }
                }
            }
        }
    }, []);

    return (
        <h1>Hello again</h1>
    )
}
export default Space;