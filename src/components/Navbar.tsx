import { useContext, useState } from "react";
import Modal from "./Modal";
import Context, { State } from "../context/Context";

function Navbar() {
    const [modalOpen, setModalOpen] = useState(false);

    const { test } = useContext(Context) as State;

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
                        onAction={toggleModel}
                    >
                        <div className="space_modal_content">
                            <input
                                type="text"
                                name="space_name"
                                spellCheck="false"
                                className="space_name"
                                placeholder="Enter sapce name"
                            />
                        </div>
                    </Modal>
                )
            }
        </div>
    )
}

export default Navbar;