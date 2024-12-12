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
    var layers: Phaser.Tilemaps.TilemapLayer[] | null;

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
                        debug: true
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
                const map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32 });

                const tileSets = [
                    map.addTilesetImage("floors"),
                    map.addTilesetImage("garden"),
                    map.addTilesetImage("office_pallete"),
                    map.addTilesetImage("pottedplants"),
                    map.addTilesetImage("walls")
                ].filter(tileset => tileset != null);
                const objectLayer = map.getObjectLayer("office_table");

                const tableColliders: Phaser.GameObjects.Rectangle[] = [];

                objectLayer?.objects.forEach(object => {
                    if (object.x && object.y && object.width && object.height) {
                        const collider = this.add.rectangle(
                            object.x + object.width / 2,
                            object.y + object.height / 2,
                            object.width,
                            object.height
                        );

                        this.physics.add.existing(collider, true);

                        tableColliders.push(collider);
                    }
                });

                layers = map.layers.map((layer, i) => map.createLayer(i, tileSets));

                layers![1]?.setTint(0xff0000);

                player.current = this.physics.add.sprite(400, 400, "player", 0);

                layers![0].setDepth(0);
                layers![1].setDepth(1);
                player.current.setDepth(2);
                layers![2].setDepth(3);

                tableColliders.forEach(collider => {
                    this.physics.add.collider(player.current!, collider);
                });

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
                layers![1].setCollisionByExclusion([-1]);
                cursors = this.input.keyboard?.createCursorKeys();

                if (layers)
                    this.physics.add.overlap(player.current, layers![1], () => {
                        const tile = layers![1].getTileAtWorldXY(
                            player.current!.x,
                            player.current!.y,
                            true
                        );
                        if (tile && (tile.index === 1006 || tile.index === 956)) {
                            console.log("Overlap with specific tile detected!");
                        }
                    });

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