import React, { useState } from "react"
import Context from "./Context";
import { useNavigate } from "react-router-dom";
import { FormData, StateProps } from "../types/StateTypes";


const test = () => {
    console.log("Hello");
}

const AppState: React.FC<StateProps> = ({ children }) => {
    const navigate = useNavigate();

    const createSpace = (name: string) => {
        navigate(`/space/${123}`);
    }

    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        username: '',
        confirmPassword: '',
        rememberMe: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <Context.Provider value={{
            test,
            createSpace,
            formData,
            handleInputChange,
            handleSubmit
        }
        }>
            {children}
        </Context.Provider>
    )
}

export default AppState;