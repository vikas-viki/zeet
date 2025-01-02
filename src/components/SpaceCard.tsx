import React, { useState } from "react";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { SpaceCardProps } from "../types/StateTypes";
import { useMyContext } from "../context/Context";
import Modal from "./Modal";

const SpaceCard: React.FC<SpaceCardProps> = ({ space }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [spaceName, setSpaceName] = useState("");
    const { editSpace, deleteSpace } = useMyContext();

    const toggleModel = () => {
        setModalOpen(prev => !prev);
    }
    return (
        <div className="space_card">
            <div
                className="space_card_image"
                style={{ backgroundImage: `url(${space.spaceimage})` }}
            ></div>
            <div className="space_card_title">
                <span>{space.spacename}</span>
                <EllipsisVertical stroke="#000" className="ellipsis icon" />
                <div className="space_card_options">
                    <button
                        onClick={toggleModel}
                        >
                        <Pencil className="space_card_opt" size={16} /> <span>Edit</span>
                    </button>
                    <button
                        onClick={() => {
                            deleteSpace(space.spacename, space.spaceid);
                        }}>
                        <Trash className="space_card_opt" size={16} /> <span>Delete</span>
                    </button>
                </div>
            </div>
            {
                modalOpen && (
                    <Modal
                        title="Edit Space"
                        actionText="Change"
                        onClose={toggleModel}
                        onAction={() => editSpace(space.spacename, space.spaceid, spaceName, toggleModel)}
                    >
                        <div className="space_modal_content">
                            <input
                                type="text"
                                name="space_name"
                                spellCheck="false"
                                className="space_name"
                                placeholder="Enter new sapce name"
                                value={spaceName}
                                onChange={(e) => setSpaceName(e.target.value)}
                            />
                        </div>
                    </Modal>
                )
            }
        </div>
    );
};

export default SpaceCard;
