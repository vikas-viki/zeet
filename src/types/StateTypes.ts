import { ReactNode } from "react";

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

export type RoomUsers = {
    [userId: string]: {
        userName: string;
        color: string;
    }
};

export type OtherUsers = {
    [userId: string]: string;
}