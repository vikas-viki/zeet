import { CompositeTilemap } from "@pixi/tilemap";
import { AnimatedSprite, Application, Assets, Rectangle, Texture } from "pixi.js";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Map, PlayerSprites } from "../types/mapTypes";

const GAME_CONFIG = {
    width: 1200,
    height: 850,
    playerSpeed: 1,
    tileSize: 32,
    spriteSheetWidth: 32,
    spriteSheetHeight: 40
};

const Space: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const playerRef = useRef<AnimatedSprite | null>(null);
    const keysRef = useRef<Record<string, boolean>>({});
    var playerSpriteSheet = {} as PlayerSprites;

    const assetBundle = useMemo(() => ({
        tilemap: {
            map: '/src/map_assets/map.json',
            garden: '/src/map_assets/garden.png',
            pottedplants: '/src/map_assets/pottedplants.png',
            office_pallete: '/src/map_assets/office_pallete.png'
        }
    }), []);

    const keysDown = useCallback((e: KeyboardEvent) => {
        keysRef.current[e.key] = true;
    }, []);
    const keysUp = useCallback((e: KeyboardEvent) => {
        keysRef.current[e.key] = false;
    }, []);

    const createPlayerSheet = () => {
        const player = Assets.get("player");
        const { spriteSheetHeight: h, spriteSheetWidth: w } = GAME_CONFIG;

        return {
            down: [new Texture({ source: player.source, frame: new Rectangle(1, 0, w, h) })],
            up: [new Texture({ source: player.source, frame: new Rectangle(6 * w, 0, w, h) })],
            left: [new Texture({ source: player.source, frame: new Rectangle(3 * w, 0, w, h) })],
            right: [new Texture({ source: player.source, frame: new Rectangle(9 * w, 0, w, h) })],
            walkUp: [
                new Texture({ source: player.source, frame: new Rectangle(7 * w, 0, w, h) }),
                new Texture({ source: player.source, frame: new Rectangle(8 * w, 0, w, h) }),
                new Texture({ source: player.source, frame: new Rectangle(6 * w, 0, w, h) })
            ],
            walkDown: [
                new Texture({ source: player.source, frame: new Rectangle(1 * w, 0, w, h) }),
                new Texture({ source: player.source, frame: new Rectangle(2 * w, 0, w, h) }),
                new Texture({ source: player.source, frame: new Rectangle(1, 0, w, h) })
            ],
            walkLeft: [
                new Texture({ source: player.source, frame: new Rectangle(4 * w, 0, w, h) }),
                new Texture({ source: player.source, frame: new Rectangle(5 * w, 0, w, h) }),
                new Texture({ source: player.source, frame: new Rectangle(3 * w, 0, w, h) })
            ],
            walkRight: [
                new Texture({ source: player.source, frame: new Rectangle(10 * w, 0, w, h) }),
                new Texture({ source: player.source, frame: new Rectangle(11 * w, 0, w, h) }),
                new Texture({ source: player.source, frame: new Rectangle(9 * w, 0, w, h) })
            ]
        }
    }

    const gameLoop = useCallback(() => {
        const player = playerRef.current;
        const keys = keysRef.current;
        const app = appRef.current;

        if (!player || !app) return;

        const movePlayer = (textures: Texture[], dx: number, dy: number) => {
            if (!player.playing) {
                player.textures = textures;
                player.play();
            }
            player.x += dx;
            player.y += dy;
        }

        if (keys["w"] || keys["ArrowUp"]) movePlayer(playerSpriteSheet.walkUp, 0, -GAME_CONFIG.playerSpeed);
        if (keys["s"] || keys["ArrowDown"]) movePlayer(playerSpriteSheet.walkDown, 0, GAME_CONFIG.playerSpeed);
        if (keys["a"] || keys["ArrowLeft"]) movePlayer(playerSpriteSheet.walkLeft, -GAME_CONFIG.playerSpeed, 0);
        if (keys["d"] || keys["ArrowRight"]) movePlayer(playerSpriteSheet.walkRight, GAME_CONFIG.playerSpeed, 0);
    }, []);

    useEffect(() => {
        const setUpGame = async () => {
            const app = new Application();
            await app.init({
                width: GAME_CONFIG.width,
                height: GAME_CONFIG.height,
                backgroundColor: 0x1099bb
            });

            if (canvasRef.current && !canvasRef.current.hasChildNodes()) {
                canvasRef.current.appendChild(app.canvas);
            }

            appRef.current = app;

            Assets.addBundle('tilemap', assetBundle.tilemap);
            const resources = await Assets.loadBundle('tilemap');
            console.log(resources);
            const tilemap = renderTilemap(resources);
            app.stage.addChild(tilemap);

            Assets.add({ alias: "player", src: "/src/map_assets/player.png" });
            await Assets.load("player");

            playerSpriteSheet = createPlayerSheet();

            const player = new AnimatedSprite(playerSpriteSheet.down);

            player.anchor.set(0.5);
            player.animationSpeed = 0.1;
            player.loop = false;
            player.x = app.screen.width / 2;
            player.y = app.screen.height / 2;
            playerRef.current = player;

            app.stage.addChild(player);
            app.ticker.add(gameLoop);
        }
        setUpGame();
        window.addEventListener("keydown", keysDown);
        window.addEventListener("keyup", keysUp);
    }, []);

    return <div ref={canvasRef} />
}

export default Space;

function renderTilemap(resources: any) {
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
                    const tileX = (index % layer.width) * tileSize;
                    const tileY = Math.floor(index / layer.width) * tileSize;
                    const localTileId = tileId - tileset.firstgid;

                    const columns = tileset.imagewidth / tileSize;
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