import { ReactNode } from "react";
import { types } from "mediasoup-client";

export interface StateProps {
    children: ReactNode;
}

export type FormData = {
    email: string;
    password: string;
    username: string;
    confirmPassword: string;
    rememberMe: boolean;
};

export type GoogleCredential = {
    aud: string;
    azp: string;
    email: string;
    email_verified: boolean;
    exp: integer;
    family_name: string;
    given_name: string;
    iat: integer;
    iss: string;
    jti: string;
    name: string;
    nbf: integer;
    picture: string;
    sub: string;
}

export type SpaceProps = {
    spacename: string;
    spaceid: string;
    spaceimage: string;
    linked: boolean;
}

export type SpaceCardProps = {
    space: SpaceProps;
}

export type UserSpaces = {
    spaceimage: string;
    spaceid: string;
    spacename: string;
    linked: boolean;
}[];

export type UserSpacesResponse = {
    created_at: string;
    mapid: string;
    spaceid: string;
    spacename: string;
    userid: string;
    ownerid: string;
}[];

export type Spaces = {
    mapid: string;
    banner: string;
    name: string;
    map: any;
}[];

export type RoomUser = {
    userName: string;
    color: string;
    audioProducerId: string | null;
    videoProducerId: string | null;
    audioPaused: boolean;
    videoPaused: boolean;
};

export type RoomUsers = {
    [userId: string]: {
        userName: string;
        color: string;
        audioProducerId: string | null;
        audioPaused: boolean;
        videoPaused: boolean;
        videoProducerId: string | null;
    }
};

export type OtherUsers = {
    [userId: string]: string;
}

export type RoomChat = {
    userName: string;
    text: string;
    time: string;
}[];

export type ProducerTransport = {
    audio: types.Transport | null;
    video: types.Transport | null;
};
export type ConsumerTransport = {
    audios: types.Transport[];
    videos: types.Transport[];
};

export type ConsumerStreams = {
    [userId: string]: {
        audio: MediaStream | null;
        video: MediaStream | null;
    }
};