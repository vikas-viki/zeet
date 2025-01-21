import { useState } from "react";
import Modal from "./Modal";
import { useAppContext } from "../context/Contexts";
import profile from "../assets/profile.png";
import { useNavigate } from "react-router-dom";
import { Link } from "lucide-react";

function Navbar() {
    const [modal1Open, setModal1Open] = useState(false);
    const [modal2Open, setModal2Open] = useState(false);
    const [spaceName, setSpaceName] = useState("");
    const [spaceId, setSpaceId] = useState("");
    const { createSpace, linkSpace } = useAppContext();

    const navigate = useNavigate();

    const toggleModel1 = () => {
        setModal1Open(prev => !prev);
    }
    const toggleModel2 = () => {
        setModal2Open(prev => !prev);
    }
    return (
        <div className="navbar">
            {/* <span className="navbar_title">Spaces</span> */}
            <button className="button link_space" onClick={toggleModel2}><Link size={20} /></button>
            <button className="button" onClick={toggleModel1}>Create new space</button>
            <button className="profile_icon"
                onClick={() => {
                    navigate("/profile");
                }}
            >
                <img src={profile} alt="U" />
            </button>
            {
                modal1Open && (
                    <Modal
                        title="Create new space"
                        actionText="Create"
                        onClose={toggleModel1}
                        onAction={() => createSpace(spaceName, toggleModel1)}
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
            {
                modal2Open && (
                    <Modal
                        title="Link a space"
                        actionText="Link"
                        onClose={toggleModel2}
                        onAction={() => linkSpace(spaceId, toggleModel2)}
                    >
                        <div className="space_modal_content">
                            <input
                                type="text"
                                name="space_id"
                                spellCheck="false"
                                className="space_name"
                                placeholder="Enter sapce id"
                                value={spaceId}
                                onChange={(e) => setSpaceId(e.target.value)}
                            />
                        </div>
                    </Modal>
                )
            }
        </div>
    )
}

export default Navbar;