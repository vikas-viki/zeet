import { AnimatedSprite, Application, Assets, Rectangle, Texture } from 'pixi.js';
import { CompositeTilemap } from "@pixi/tilemap";
import { useEffect, useRef } from 'react';
import { Map, PlayerSprites } from '../types/mapTypes';

const Space = () => {
    const canvasRef = useRef<HTMLDivElement>(null);
    var playerSheet: PlayerSprites = {} as PlayerSprites;
    var app: Application;
    var keys: any = {};
    var player: AnimatedSprite;
    var speed = 2;

    const keysDown = (e: KeyboardEvent) => {
        keys[e.key] = true;
    }
    const keysUp = (e: KeyboardEvent) => {
        keys[e.key] = false;
    }

    // to handle sprite changes on key press
    const gameLoop = () => {
        if (keys["w"] || keys["ArrowUp"]) {
            if (!player.playing) {
                player.textures = playerSheet.walkUp;
                player.play();
            }
            player.y -= speed;
        }
        if (keys["s"] || keys["ArrowDown"]) {
            if (!player.playing) {
                player.textures = playerSheet.walkDown;
                player.play();
            }
            player.y += speed;
        }
        if (keys["a"] || keys["ArrowLeft"]) {
            if (!player.playing) {
                player.textures = playerSheet.walkLeft;
                player.play();
            }
            player.x -= speed;
        }
        if (keys["d"] || keys["ArrowRight"]) {
            if (!player.playing) {
                player.textures = playerSheet.walkRight;
                player.play();
            }
            player.x += speed;
        }
    }

    // to render the tiled map (JSON) in screen
    const loadMap = async () => {
        Assets.addBundle('tilemap', {
            map: '/src/map_assets/map.json',
            garden: '/src/map_assets/garden.png',
            pottedplants: '/src/map_assets/pottedplants.png',
            office_pallete: '/src/map_assets/office_pallete.png'
        });

        const resources = await Assets.loadBundle('tilemap');
        const mapData: Map = resources.map;
        const tilemap = new CompositeTilemap();

        mapData.layers.forEach((layer) => {
            if (layer.type === "tilelayer") {
                const tileSize = mapData.tilewidth;

                layer.data.forEach((tileId, index) => {
                    if (tileId === 0) return;

                    const tileset = mapData.tilesets.find((tileset) => (
                        tileId >= tileset.firstgid &&
                        tileId < tileset.firstgid + tileset.tilecount
                    ));

                    if (tileset) {
                        const textureName = tileset.name.toLowerCase();
                        // location to place in ui
                        const tileX = (index % layer.width) * tileSize;
                        const tileY = Math.floor(index / layer.width) * tileSize;
                        const localTileId = tileId - tileset.firstgid;

                        const columns = tileset.imagewidth / tileSize;
                        // location to get from the tilemap
                        const textureX = (localTileId % columns) * tileSize;
                        const textureY = Math.floor(localTileId / columns) * tileSize;

                        const texture: Texture = resources[textureName];
                        if (!texture) {
                            console.error(`Texture ${textureName} not found!`);
                            return;
                        }

                        tilemap.tile(texture, tileX, tileY, {
                            u: textureX,
                            v: textureY,
                            tileWidth: tileSize,
                            tileHeight: tileSize
                        });
                    }
                });
            }
        });
        return tilemap;
    }

    // creating a player character
    const createPlayer = () => {
        player = new AnimatedSprite(playerSheet.down);
        player.anchor.set(0.5);
        player.animationSpeed = 0.1;
        player.loop = false;
        player.x = app.screen.width / 2;
        player.y = app.screen.height / 2;
        app.stage.addChild(player);
        player.play();
    }    

    // creating player movement textures
    const createPlayerSheet = (playerSprite: Texture) => {
        let player = playerSprite;

        let w = 32;
        let h = 40;

        playerSheet.down = [
            new Texture({
                source: player.source,
                frame: new Rectangle(1, 0, w, h)
            })
        ];
        playerSheet.up = [
            new Texture({
                source: player.source,
                frame: new Rectangle(6 * w, 0, w, h)
            })
        ];
        playerSheet.left = [
            new Texture({
                source: player.source,
                frame: new Rectangle(3 * w, 0, w, h)
            })
        ];
        playerSheet.right = [
            new Texture({
                source: player.source,
                frame: new Rectangle(9 * w, 0, w, h)
            })
        ];
        playerSheet.walkUp = [
            new Texture({
                source: player.source,
                frame: new Rectangle(7 * w, 0, w, h)
            }),
            new Texture({
                source: player.source,
                frame: new Rectangle(8 * w, 0, w, h)
            }),
            new Texture({
                source: player.source,
                frame: new Rectangle(6 * w, 0, w, h)
            })
        ]
        playerSheet.walkDown = [
            new Texture({
                source: player.source,
                frame: new Rectangle(1 * w, 0, w, h)
            }),
            new Texture({
                source: player.source,
                frame: new Rectangle(2 * w, 0, w, h)
            }),
            new Texture({
                source: player.source,
                frame: new Rectangle(1, 0, w, h)
            })
        ]
        playerSheet.walkLeft = [
            new Texture({
                source: player.source,
                frame: new Rectangle(4 * w, 0, w, h)
            }),
            new Texture({
                source: player.source,
                frame: new Rectangle(5 * w, 0, w, h)
            }),
            new Texture({
                source: player.source,
                frame: new Rectangle(3 * w, 0, w, h)
            })
        ]
        playerSheet.walkRight = [
            new Texture({
                source: player.source,
                frame: new Rectangle(10 * w, 0, w, h)
            }),
            new Texture({
                source: player.source,
                frame: new Rectangle(11 * w, 0, w, h)
            }),
            new Texture({
                source: player.source,
                frame: new Rectangle(9 * w, 0, w, h)
            })
        ]
    }

    // after loading the player sprite
    const doneLoading = (playerSprite: Texture) => {
        createPlayerSheet(playerSprite);
        createPlayer();
        app.ticker.add(gameLoop);
    }

    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);

    useEffect(() => {
        app = new Application();

        app.init({
            width: 1200,
            height: 850,
            backgroundColor: 0x1099bb
        }).then(async () => {
            if (canvasRef.current && !canvasRef.current.hasChildNodes()) {
                canvasRef.current.appendChild(app.canvas);
                const tilemap = await loadMap();
                app.stage.addChild(tilemap);
            }

            Assets.add({ alias: "player", src: "/src/map_assets/player.png" });
            const playerSprite = await Assets.load("player");
            
            doneLoading(playerSprite);
        });
    }, []);

    return (
        <div ref={canvasRef} />
    );
}

export default Space;