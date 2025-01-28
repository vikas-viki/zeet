import map from "../map_assets/map.json";
import walls from "../map_assets/walls.png";
import floors from "../map_assets/floors.png";
import garden from "../map_assets/garden.png";
import playerimg from "../map_assets/player.png";
import pottedplants from "../map_assets/pottedplants.png";
import office_pallete from "../map_assets/office_pallete.png";
import { TileIndex, TilemapLayers } from "../types/PhaserTypes";
import { eventBus } from "../helpers/EventBus";
import { constants } from "../helpers/constants";
import { socket } from "../context/SocketState";

export class GameScene extends Phaser.Scene {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private player!: Phaser.Physics.Arcade.Sprite;
    private layers: TilemapLayers = {};
    private map!: Phaser.Tilemaps.Tilemap;
    private tileIndex: TileIndex = {};
    private otherPlayers: { [id: string]: { player: Phaser.Physics.Arcade.Sprite, name: Phaser.GameObjects.Text } } = {};
    private colliders: Phaser.GameObjects.Rectangle[] = [];

    // event states
    private joinedStage: boolean = false;
    private leftStage: boolean = false;
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


            if (this.cursors.left.isDown) {
                this.movePlayer("left");
                this.player.setVelocityX(-160);
                this.player.anims.play("left", true);
                this.stop = false;
                console.log("position: ", this.player.x, this.player.y);
            } else if (this.cursors.right.isDown) {
                this.movePlayer("right");
                this.player.setVelocityX(160);
                this.player.anims.play("right", true);
                this.stop = false;
                console.log("position: ", this.player.x, this.player.y);
            }

            if (this.cursors.up.isDown) {
                this.movePlayer("up");
                this.player.setVelocityY(-160);
                this.player.anims.play("up", true);
                this.stop = false;
                console.log("position: ", this.player.x, this.player.y);
            } else if (this.cursors.down.isDown) {
                this.movePlayer("down");
                this.player.setVelocityY(160);
                this.player.anims.play("down", true);
                this.stop = false;
                console.log("position: ", this.player.x, this.player.y);
            }

            if (
                !this.cursors.left.isDown &&
                !this.cursors.right.isDown &&
                !this.cursors.up.isDown &&
                !this.cursors.down.isDown
            ) {
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
                        if (!this.joinedStage)
                            eventBus.emit(constants.events.collidingJoin);
                    }
                } else {
                    if (highlight) {
                        highlight.destroy(); // Remove the rectangle
                        highlight = null;    // Reset the reference
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
        eventBus.on(constants.server.playersLocation, (data: { [key: string]: { x: number, y: number, userId: string, userName: string } }[]) => {
            console.log("other players ", data, this.userId, this.physics);
            data.forEach((user) => {
                if (!this.otherPlayers[user.userId.toString()] && user.userId.toString() !== this.userId && Object(this.otherPlayers).length != 0) {
                    this.otherPlayers[user.userId.toString()] = {
                        player: this.physics?.add?.sprite(Number(user.x), Number(user.y), "player", 0),
                        name: this.add.text(Number(user.x), Number(user.y) - 20, user.userName.toString(), this.textStyle).setOrigin(0.5, 1)
                    }
                    this.colliders.forEach((collider) => {
                        this.physics.add.collider(this.otherPlayers[user.userId.toString()].player, collider);
                    });
                }
            })
        })

        socket.on(constants.server.userLeftSpace, (data: { userId: string }) => {
            console.log("User left space", data);
            this.otherPlayers[data.userId].player.destroy();
            this.otherPlayers[data.userId].name.destroy();
            delete this.otherPlayers[data.userId];
        });

        socket.on(constants.server.userJoinedSpace, (data: { userId: string, spaceId: string, userName: string }) => {
            if (!this.otherPlayers[data.userId]) {
                this.otherPlayers[data.userId] = {
                    player: this.physics.add.sprite(400, 400, "player", 0),
                    name: this.add.text(400, 380, data.userName.toString(), this.textStyle).setOrigin(0.5, 1)
                }
                this.colliders.forEach((collider) => {
                    this.physics.add.collider(this.otherPlayers[data.userId.toString()].player, collider);
                });
            }
            console.log("spaceId: ", this.spaceId);
            socket.emit(constants.client.location, { x: this.player.x, y: this.player.y, userId: this.userId, to: data.userId, spaceId: this.spaceId });
        });

        socket.on(constants.server.userMoved, (data: { userId: string, key: string }) => {
            if (this.otherPlayers[data.userId]) {
                this.otherPlayers[data.userId].player.setVelocity(0);
                console.log("moving player, ", data.key);
                if (data.key === "left" || data.key === "right") {
                    this.otherPlayers[data.userId].player.setVelocityX(this.velocity[data.key]);
                    this.otherPlayers[data.userId].player.anims.play(data.key, true);
                } else if (data.key === "up" || data.key === "down") {
                    this.otherPlayers[data.userId].player.setVelocityY(this.velocity[data.key]);
                    this.otherPlayers[data.userId].player.anims.play(data.key, true);
                } else {
                    this.otherPlayers[data.userId].player.setVelocity(0);
                    this.otherPlayers[data.userId].player.anims.stop();
                }
                this.otherPlayers[data.userId].name.setPosition(this.otherPlayers[data.userId].player.x, this.otherPlayers[data.userId].player.y - 20)
            }
        })

        eventBus.on(constants.events.joinedRoom, (args: { spaceId: string, userName: string }) => {
            this.joinedStage = true;
            this.leftStage = false;
            socket.emit(constants.client.joinRoom, { userId: this.userId, roomId: args.spaceId + constants.spaceRooms.room1, userName: args.userName });
        });
        eventBus.on(constants.events.leftRoom, () => {
            this.joinedStage = false;
            this.leftStage = true;
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