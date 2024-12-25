import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

type FormData = {
    email: string;
    password: string;
    username: string;
    confirmPassword: string;
    rememberMe: boolean;
};

function App() {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
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
        <div className="auth_container">
            <div className="auth_card">
                <div className="auth_header">
                    <h1>Welcome back!</h1>
                    <p>Login to get started</p>
                </div>

                <div className="auth_tabs">
                    <button
                        className={`tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => setActiveTab('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth_form">
                    {activeTab === 'signup' && (
                        <div className="input_group">
                            <User className="icon" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    )}

                    <div className="input_group">
                        <Mail className="icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="input_group">
                        <Lock className="icon" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {activeTab === 'signup' && (
                        <div className="input_group">
                            <Lock className="icon" />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    )}

                    <div className="remember_me">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleInputChange}
                        />
                        <label htmlFor="rememberMe">Keep me signed in</label>
                    </div>

                    <button type="submit" className="submit_button">
                        {activeTab === 'login' ? 'Sign In' : 'Sign Up'}
                    </button>

                    <div className="divider">
                        <span>or</span>
                    </div>
                    <div className='google_login'>
                        <GoogleOAuthProvider clientId={CLIENT_ID}>
                            <GoogleLogin
                                width="450"
                                theme='filled_black'
                                size='large'
                                shape='pill'
                                auto_select={true}
                                onSuccess={credentialResponse => {
                                    const credentials = jwtDecode(credentialResponse.credential!);
                                    console.log(credentials);
                                    console.log("sigin successful: ", credentialResponse);
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                }}
                            />
                        </GoogleOAuthProvider>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default App;
