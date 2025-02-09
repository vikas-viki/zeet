import { KeyRound, LogOut, Pencil, Save, X } from "lucide-react";
import profile from "../assets/profile.png";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/Contexts";
import axios from "axios";
import { SERVER_URL } from "../context/AppState";
import toast from "react-hot-toast";

const Profile = () => {
    const [editName, setEditName] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [tempNewName, setTempNewName] = useState("CoolPlayer123");

    const { updateNickName, userName, setUserName, updatePassword, userId, setUserId } = useAppContext();

    const saveName = () => {
        updateNickName(tempNewName);
        setUserName(tempNewName);
        setEditName(false);
    }

    const logout = () => {
        axios.post(`${SERVER_URL}/auth/logout`, {}, { withCredentials: true }).then((res) => {
            if (res.data.message === "LOGOUT_SUCCESS") {
                setUserId("");
                localStorage.removeItem("userId");
                localStorage.removeItem("userName");
                toast.success("Logged out successfully");
                window.location.href = "/login"
            } else {
                toast.error("Failed to logout");
            }
        }).catch((err) => {
            toast.error("Failed to logout");
            console.log(err);
        });;
    }

    useEffect(() => {
        setTempNewName(userName);
    }, [userName, userId]);

    return (
        <div className="profile_main">
            <div className="profile_content">
                <div className="profile_container_1">
                    <img src={profile} alt="P" />
                    {editName ?
                        (
                            <div className="editing_name">
                                <input type="text"
                                    className={`profile_nickname`}
                                    value={tempNewName}
                                    onChange={(e) => setTempNewName(e.target.value)}
                                />
                                <Save size={17} onClick={saveName} />
                                <X size={17} onClick={() => {
                                    setEditName(false);
                                    setTempNewName(userName);
                                }} />
                            </div>
                        ) : (
                            <div className="not_editing_name">
                                <h1>{userName}</h1>
                                <Pencil size={17} onClick={() => {
                                    setEditName(true);
                                }} />
                            </div>
                        )
                    }
                </div>
                <div className="profile_container_2">
                    {
                        changePassword ? (
                            <div className="change_password_container">
                                <input type="password" placeholder="Enter new password"
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <div>
                                    <button className="save_password_button"
                                        onClick={() => {
                                            updatePassword(newPassword);
                                            setChangePassword(false);
                                        }}
                                    >
                                        Save Password
                                    </button>
                                    <button className="cancel_password_button"
                                        onClick={() => {
                                            setChangePassword(false);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button className="change_password_button"
                                onClick={() => {
                                    setChangePassword(true);
                                }}
                            >
                                <KeyRound size={20} />
                                <span>Change Password</span>
                            </button>
                        )
                    }
                </div>
                <div className="profile_container_3">
                    <button className="logout_button" onClick={logout}> <LogOut size={20} /> Logout</button>
                </div>
            </div>
        </div>
    )
}

export default Profile;