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