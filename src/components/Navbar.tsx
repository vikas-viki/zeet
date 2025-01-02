import { useState } from "react";
import Modal from "./Modal";
import { useMyContext } from "../context/Context";

function Navbar() {
    const [modalOpen, setModalOpen] = useState(false);
    const [spaceName, setSpaceName] = useState("");
    const { createSpace } = useMyContext();

    const toggleModel = () => {
        setModalOpen(prev => !prev);
    }
    return (
        <div className="navbar">
            {/* <span className="navbar_title">Spaces</span> */}
            <button className="button" onClick={toggleModel}>Create new space</button>
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