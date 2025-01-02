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
}

export type SpaceCardProps = {
    space: SpaceProps;
}

export type UserSpaces = {
    spaceimage: string;
    spaceid: number;
    spacename: string;
}[];

export type UserSpacesResponse = {
    userid: string;
    spaceid: number;
    spacename: string;
}[];

export type Spaces = {
    spaceid: number;
    spaceimage: string;
}[];