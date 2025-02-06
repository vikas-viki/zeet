import React, { useEffect, useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { CredentialResponse, GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FormData, GoogleCredential } from '../types/StateTypes';
import { useAppContext } from '../context/Contexts';
import toast from 'react-hot-toast';
import { SERVER_URL } from '../context/AppState';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
    const { getUniqueId, getHash, setUserId, setUserName } = useAppContext();
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        username: '',
        confirmPassword: '',
        rememberMe: false,
    });

    const { userId } = useAppContext();

    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const authorize = async (_formData: any, signup: boolean, google: boolean) => {
        try {
            if (signup) {
                const response = await axios.post(`${SERVER_URL}/signup`, {
                    email: _formData.email,
                    username: _formData.username,
                    password: google ? _formData.password : getHash(_formData.password),
                    id: google ? _formData.id : getUniqueId(_formData.username, _formData.email, _formData.password),
                    rememberMe: _formData.rememberMe
                }, { withCredentials: true });

                if (response.status == 200) {
                    setUserId(response.data.userId);
                    setUserName(response.data.userName);
                    toast.success("Signup successful.");
                    navigate("/spaces");
                }

                console.log({ signup: response });
            } else {
                const response = await axios.post(`${SERVER_URL}/login`, {
                    email: _formData.email,
                    password: google ? _formData.password : getHash(_formData.password),
                    rememberMe: _formData.rememberMe
                }, { withCredentials: true });

                if (response.status == 200) {
                    toast.success("Login successful.");
                    setUserId(response.data.userId);
                    setUserName(response.data.userName);
                    navigate("/spaces")
                }

                console.log({ login: response });
            }
        } catch (e: any) {
            if (e?.response.data.message === "DUPLICATE_USERNAME") {
                toast.error("Choose different Username!");
            } else if (e?.response.data.message === "DUPLICATE_EMAIL") {
                toast.error("User exists, login instead!");
            } else if (e?.response.data.message === "NO_USER_FOUND") {
                toast.error("User not found! Signup instead.");
            } else {
                toast.error("Error occurred!");
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);

        const signup = activeTab === 'signup';

        if (formData.password !== formData.confirmPassword && signup) {
            toast.error("Confirm password didn't match!");
            return;
        }

        await authorize(formData, signup, false);
    };

    const googleSubmit = async (credentialResponse: CredentialResponse) => {
        const credentials: GoogleCredential = jwtDecode(credentialResponse.credential!);
        console.log(credentials);

        const signup = activeTab === 'signup';
        var _formData;

        _formData = {
            email: credentials.email,
            password: `${credentials.sub}${getHash('GOOGLE')}`,
            rememberMe: formData.rememberMe,
            id: '',
            username: ''
        }
        if (signup) {
            _formData.id = credentials.sub;
            _formData.username = credentials.name;
        }
        await authorize(_formData, signup, true);
    }

    useEffect(() => {
        if (userId.length > 0) {
            navigate("/spaces");
        }
    })

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
                            minLength={8}
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
                                minLength={8}
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
                                onSuccess={googleSubmit}
                                onError={() => {
                                    toast.error('Login failed!');
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
