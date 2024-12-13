import map from "../map_assets/map.json";
import walls from "../map_assets/walls.png";
import floors from "../map_assets/floors.png";
import garden from "../map_assets/garden.png";
import playerimg from "../map_assets/player.png";
import pottedplants from "../map_assets/pottedplants.png";
import office_pallete from "../map_assets/office_pallete.png";
import { TileIndex, TilemapLayers } from "../types/PhaserTypes";

export class GameScene extends Phaser.Scene {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private player!: Phaser.Physics.Arcade.Sprite;
    private layers: TilemapLayers = {};
    private map!: Phaser.Tilemaps.Tilemap;
    private tileIndex: TileIndex = {};

    constructor() {
        super({ key: "GameScene" });
    }

    preload() {
        this.load.image("walls", walls);
        this.load.image("garden", garden);
        this.load.image("floors", floors);
        this.load.tilemapTiledJSON("map", map);
        this.load.image("pottedplants", pottedplants);
        this.load.image("office_pallete", office_pallete);
        this.load.spritesheet("player", playerimg, { frameWidth: 32, frameHeight: 40 });
    }

    create() {
        this.loadTileIndexes();

        this.createTilemapAndLayers();

        this.createPlayers();

        this.setLayerDepths();

        this.createColliders();

        this.createAnimations();

        this.createInteractionHighlights();

        this.cursors = this.input.keyboard?.createCursorKeys();
    }

    update() {
        if (this.cursors && this.player) {
            this.player.setVelocity(0);

            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                this.player.anims.play("left", true);
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(160);
                this.player.anims.play("right", true);
            }

            if (this.cursors.up.isDown) {
                this.player.setVelocityY(-160);
                this.player.anims.play("up", true);
            } else if (this.cursors.down.isDown) {
                this.player.setVelocityY(160);
                this.player.anims.play("down", true);
            }

            if (
                !this.cursors.left.isDown &&
                !this.cursors.right.isDown &&
                !this.cursors.up.isDown &&
                !this.cursors.down.isDown
            ) {
                this.player.setVelocity(0);
                this.player.anims.pause();
            }
        }
    }

    private createTilemapAndLayers() {
        this.map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32 });

        const tilesets = [
            this.map.addTilesetImage("floors"),
            this.map.addTilesetImage("garden"),
            this.map.addTilesetImage("office_pallete"),
            this.map.addTilesetImage("pottedplants"),
            this.map.addTilesetImage("walls"),
        ].filter((tileset) => tileset != null);

        this.layers["basement"] = this.map.createLayer(0, tilesets)!;
        this.layers["interactive"] = this.map.createLayer(1, tilesets)!;
        this.layers["office"] = this.map.createLayer(2, tilesets)!;
    }

    private setLayerDepths() {
        this.layers.basement.setDepth(0);
        this.layers.interactive.setDepth(1);
        this.player.setDepth(2);
        this.layers.office.setDepth(3);
    }

    private createPlayers() {
        this.player = this.physics.add.sprite(400, 400, "player", 0);
    }

    private createColliders() {
        const objectLayer = this.map.getObjectLayer("office_table");
        const tableColliders: Phaser.GameObjects.Rectangle[] = [];

        objectLayer?.objects.forEach((object) => {
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

        tableColliders.forEach((collider) => {
            this.physics.add.collider(this.player, collider);
        });
    }

    private createAnimations() {
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("player", { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "down",
            frames: this.anims.generateFrameNumbers("player", { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNumbers("player", { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("player", { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    private createInteractionHighlights() {
        if (this.layers) {
            var highlight: Phaser.GameObjects.Rectangle | null;

            this.physics.add.overlap(this.player, this.layers.interactive, () => {
                const tile = this.layers.interactive.getTileAtWorldXY(
                    this.player!.x,
                    this.player!.y,
                    true
                );

                if (tile && (
                    tile.index === this.tileIndex.chairUp ||
                    tile.index === this.tileIndex.chairDown
                )) {
                    if (!highlight) {
                        const tileWorldX = tile.x * this.map.tileWidth;
                        const tileWorldY = tile.y * this.map.tileHeight;

                        highlight = this.add.rectangle(
                            tileWorldX + this.map.tileWidth / 2,
                            tileWorldY + this.map.tileHeight / 2,
                            this.map.tileWidth * 1.5,
                            this.map.tileHeight * 1.4,
                            0x333333,
                            0.35
                        );
                    }
                } else {
                    if (highlight) {
                        highlight.destroy(); // Remove the rectangle
                        highlight = null;    // Reset the reference
                    }
                }
            });
        }
    }

    private loadTileIndexes() {
        this.tileIndex["chairUp"] = 1006;
        this.tileIndex["chairDown"] = 956;
    }
}