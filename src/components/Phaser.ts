import map from "../map_assets/map.json";
import walls from "../map_assets/walls.png";
import floors from "../map_assets/floors.png";
import garden from "../map_assets/garden.png";
import playerimg from "../map_assets/player.png";
import pottedplants from "../map_assets/pottedplants.png";
import office_pallete from "../map_assets/office_pallete.png";
import { TileIndex, TilemapLayers } from "../types/PhaserTypes";
import { eventBus } from "../helpers/EventBus";
import { constants, socket } from "../helpers/constants";

export class GameScene extends Phaser.Scene {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private player!: Phaser.Physics.Arcade.Sprite;
    private layers: TilemapLayers = {};
    private map!: Phaser.Tilemaps.Tilemap;
    private tileIndex: TileIndex = {};
    private otherPlayers: { [id: string]: { player: Phaser.Physics.Arcade.Sprite, name: Phaser.GameObjects.Text } } = {};
    private colliders: Phaser.GameObjects.Rectangle[] = [];


    private joinedStage: boolean = false;
    public userId: string = "";
    private velocity: { [key: string]: number } = {};
    private stop: boolean = true;
    private spaceId: string = "";
    private textStyle: Phaser.Types.GameObjects.Text.TextStyle = {};

    constructor() {
        super({ key: "GameScene" });

        this.velocity = {
            "left": -160,
            "right": 160,
            "up": -160,
            "down": 160,
            "stop": 0
        }

        this.textStyle = {
            fontSize: "12px",
            color: "#ffffff",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: { x: 6, y: 3 },
            fontFamily: "sans",
            fontStyle: "bold",
        }
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

        this.cameras.main.startFollow(this.player);

        this.setLayerDepths();

        this.createColliders();

        this.createAnimations();

        this.createInteractionHighlights();

        this.cursors = this.input.keyboard?.createCursorKeys();

        this.loadEventListeners();
    }

    update() {
        if (this.cursors && this.player) {
            this.player.setVelocity(0);

            let moved = false;

            if (this.cursors.left.isDown) {
                this.movePlayer("left");
                this.player.setVelocityX(this.velocity["left"]);
                this.player.anims.play("left", true);
                this.stop = false;
                moved = true;
            } else if (this.cursors.right.isDown) {
                this.movePlayer("right");
                this.player.setVelocityX(this.velocity["right"]);
                this.player.anims.play("right", true);
                this.stop = false;
                moved = true;
            }

            if (this.cursors.up.isDown) {
                this.movePlayer("up");
                this.player.setVelocityY(this.velocity["up"]);
                this.player.anims.play("up", true);
                this.stop = false;
                moved = true;
            } else if (this.cursors.down.isDown) {
                this.movePlayer("down");
                this.player.setVelocityY(this.velocity["down"]);
                this.player.anims.play("down", true);
                this.stop = false;
                moved = true;
            }

            if (!moved) {
                if (!this.stop) {
                    this.movePlayer("stop");
                    this.stop = true;
                }
                this.player.setVelocity(0);
                this.player.anims.pause();
            }


            this.player.getData("name")?.setPosition(this.player.x, this.player.y - 20);
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
        this.player.setData("name",
            this.add.text(400, 380, window.localStorage.getItem("userName")?.slice(0, 5)!, this.textStyle).setOrigin(0.5, 1)
        )
        this.userId = window.localStorage.getItem("userId") || "";
        this.spaceId = window.localStorage.getItem("spaceId") || "";
    }

    private createColliders() {
        const objectLayer = this.map.getObjectLayer("office_table");

        objectLayer?.objects.forEach((object) => {
            if (object.x && object.y && object.width && object.height) {
                const collider = this.add.rectangle(
                    object.x + object.width / 2,
                    object.y + object.height / 2,
                    object.width,
                    object.height
                );
                this.physics.add.existing(collider, true);
                this.colliders.push(collider);
            }
        });

        this.colliders.forEach((collider) => {
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
            let highlight: Phaser.GameObjects.Rectangle | null;

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
                        if (!this.joinedStage)
                            eventBus.emit(constants.events.collidingJoin);
                    }
                } else {
                    if (highlight) {
                        highlight.destroy();
                        highlight = null;
                        if (this.joinedStage)
                            eventBus.emit(constants.events.collidingLeave);
                    }
                }
            });
        }
    }

    private loadTileIndexes() {
        this.tileIndex["chairUp"] = 1006;
        this.tileIndex["chairDown"] = 956;
    }

    private loadEventListeners() {
        console.log("events: ", this.input.keyboard?.eventNames());
        eventBus.on(constants.events.messageInputFocused, () => {
            this.input.keyboard!.enabled = false;
        });
        eventBus.on(constants.events.messageInputBlurred, () => {
            this.input.keyboard!.enabled = true;
        });


        eventBus.on(constants.server.playersLocation, (data: { x: number, y: number, userId: string, userName: string }[]) => {

            data.forEach((user) => {
                const uid = user.userId.toString();
                if (uid === this.userId) return;
                if (!this.otherPlayers[uid]) {
                    this.otherPlayers[uid] = {
                        player: this.physics?.add?.sprite(Number(user.x), Number(user.y), "player", 0),
                        name: this.add.text(Number(user.x), Number(user.y) - 20, user.userName.toString(), this.textStyle).setOrigin(0.5, 1)
                    };

                    this.colliders.forEach((collider) => {
                        this.physics.add.collider(this.otherPlayers[uid].player, collider);
                    });
                } else {

                    this.otherPlayers[uid].player.setPosition(Number(user.x), Number(user.y));
                    this.otherPlayers[uid].name.setPosition(Number(user.x), Number(user.y) - 20);
                }
            });
        });

        socket.on(constants.server.userLeftSpace, (data: { userId: string }) => {
            console.log("User left space", data);
            const uid = data.userId;
            if (this.otherPlayers[uid]) {
                try {
                    this.otherPlayers[uid].player.destroy();
                    this.otherPlayers[uid].name.destroy();
                } catch { /* ignore */ }
                delete this.otherPlayers[uid];
            }
        });

        socket.on(constants.server.userJoinedSpace, (data: { userId: string, spaceId: string, userName: string }) => {

            if (data.userId === this.userId) return;
            if (!this.otherPlayers[data.userId]) {
                this.otherPlayers[data.userId] = {
                    player: this.physics.add.sprite(400, 400, "player", 0),
                    name: this.add.text(400, 380, data.userName.toString(), this.textStyle).setOrigin(0.5, 1)
                }
                this.colliders.forEach((collider) => {
                    this.physics.add.collider(this.otherPlayers[data.userId.toString()].player, collider);
                });
            }

            socket.emit(constants.client.location, { x: this.player.x, y: this.player.y, userId: this.userId, to: data.userId, spaceId: this.spaceId });
        });


        socket.on(constants.server.userMoved, (data: { userId: string, key: string, x?: number | string, y?: number | string }) => {
            const uid = data.userId;
            const sx = data.x !== undefined ? Number(data.x) : undefined;
            const sy = data.y !== undefined ? Number(data.y) : undefined;


            if (uid === this.userId) {
                if (typeof sx === "number" && typeof sy === "number") {
                    this.player.getData("name")?.setPosition(this.player.x, this.player.y - 20);
                }
                return;
            }


            if (!this.otherPlayers[uid]) return;

            const other = this.otherPlayers[uid];
            if (typeof sx === "number" && typeof sy === "number") {
                other.name.setPosition(other.player.x, other.player.y - 20);
                other.player.setPosition(sx, sy);
                if (data.key === "left" || data.key === "right") {

                    other.player.anims.play(data.key, true);
                } else if (data.key === "up" || data.key === "down") {

                    other.player.anims.play(data.key, true);
                } else {

                    other.player.anims.stop();
                }
            } else {

                other.player.setVelocity(0);
                if (data.key === "left" || data.key === "right") {
                    other.player.setVelocityX(this.velocity[data.key]);
                    other.player.anims.play(data.key, true);
                } else if (data.key === "up" || data.key === "down") {
                    other.player.setVelocityY(this.velocity[data.key]);
                    other.player.anims.play(data.key, true);
                } else {
                    other.player.setVelocity(0);
                    other.player.anims.stop();
                }
                other.name.setPosition(other.player.x, other.player.y - 20);
            }
        })

        eventBus.on(constants.events.joinedRoom, (args: { spaceId: string, userName: string }) => {
            this.joinedStage = true;
            socket.emit(constants.client.joinRoom, { userId: this.userId, roomId: args.spaceId + constants.spaceRooms.room1, userName: args.userName });
        });
        eventBus.on(constants.events.leftRoom, () => {
            this.joinedStage = false;
            socket.emit(constants.client.leaveRoom, { userId: this.userId, roomId: this.spaceId + constants.spaceRooms.room1 });
        });
    }

    private movePlayer(key: string) {

        socket.emit(
            constants.client.move,
            {
                key,
                spaceId: window.localStorage.getItem("spaceId"),
                userId: window.localStorage.getItem("userId"),
                x: this.player.x,
                y: this.player.y
            }
        );
    }
}
