import { Texture } from "pixi.js";

export type Layer = {
    data: number[];
    height: number,
    id: number,
    name: string,
    opacity: number,
    type: string,
    visible: boolean,
    width: number,
    x: number,
    y: number
}

export type Tileset = {
    columns: number,
    firstgid: number,
    image: string,
    imageheight: number,
    imagewidth: number,
    margin: number,
    name: string,
    spacing: number,
    tilecount: number,
    tileheight: number,
    tilewidth: number
}

export type Map = {
    compressionlevel: number,
    height: number,
    infinite: boolean,
    layers: Layer[],
    nextlayerid: number,
    nextobjectid: number,
    orientation: string,
    renderorder: string,
    tiledversion: string,
    tileheight: number,
    tilesets: Tileset[],
    tilewidth: number,
    type: string,
    version: string,
    width: string
}

export type PlayerSprites = {
    down: Texture[],
    up: Texture[],
    left: Texture[],
    right: Texture[],
    walkDown: Texture[],
    walkUp: Texture[],
    walkLeft: Texture[],
    walkRight: Texture[]
};