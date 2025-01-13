import { useState } from "react";
import Modal from "./Modal";
import { useMyContext } from "../context/Context";
import profile from "../assets/profile.png";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const [modalOpen, setModalOpen] = useState(false);
    const [spaceName, setSpaceName] = useState("");
    const { createSpace } = useMyContext();

    const navigate = useNavigate();

    const toggleModel = () => {
        setModalOpen(prev => !prev);
    }
    return (
        <div className="navbar">
            {/* <span className="navbar_title">Spaces</span> */}
            <button className="button" onClick={toggleModel}>Create new space</button>
            <button className="profile_icon" 
                onClick={()=>{
                    navigate("/profile");
                }}
            >
                <img src={profile} alt="U" />
            </button>
            {
                modalOpen && (
                    <Modal
                        title="Create new space"
                        actionText="Create"
                        onClose={toggleModel}
                        onAction={() => createSpace(spaceName, toggleModel)}
                    >
                        <div className="space_modal_content">
                            <input
                                type="text"
                                name="space_name"
                                spellCheck="false"
                                className="space_name"
                                placeholder="Enter sapce name"
                                value={spaceName}
                                onChange={(e) => setSpaceName(e.target.value)}
                            />
                        </div>
                    </Modal>
                )
            }
        </div>
    )
}

export default Navbar;