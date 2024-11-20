import { Application, Assets, Texture } from 'pixi.js';
import { CompositeTilemap } from "@pixi/tilemap";
import { useEffect, useRef } from 'react';
import { Map } from '../types/mapTypes';

const Space = () => {
    const canvasRef = useRef<HTMLDivElement>(null);


    async function loadMap() {
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
                        tileId < tileset.firstgid + (tileset.imagewidth / tileSize) * (tileset.imageheight / tileSize)
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

    useEffect(() => {
        const app = new Application();

        app.init({
            width: 1200,
            height: 900,
            backgroundColor: 0x1099bb
        }).then(async () => {
            if (canvasRef.current && !canvasRef.current.hasChildNodes()) {
                canvasRef.current.appendChild(app.canvas);
                const tilemap = await loadMap();
                console.log(tilemap);
                app.stage.addChild(tilemap);
            }
        });
    }, []);

    return (
        <div ref={canvasRef} />
    );
}

export default Space;