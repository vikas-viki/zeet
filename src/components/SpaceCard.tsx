import React, { useState } from "react";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { SpaceCardProps } from "../types/StateTypes";
import { useMyContext } from "../context/Context";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";

const SpaceCard: React.FC<SpaceCardProps> = ({ space }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [spaceName, setSpaceName] = useState("");
    const { editSpace, deleteSpace, setRoomId } = useMyContext();

    const navigate = useNavigate();

    const toggleModel = () => {
        setModalOpen(prev => !prev);
    }

    return (
        <div className="space_card" onClick={() => {
            setRoomId(space.roomId);
            navigate(`/space/${space.roomId.slice(-36)}`);
        }}>
            <div
                className="space_card_image"
                style={{ backgroundImage: `url(${space.spaceimage})` }}
            ></div>
            <div className="space_card_title">
                <span>{space.spacename}</span>
                <EllipsisVertical stroke="#000" className="ellipsis icon" />
                <div className="space_card_options">
                    <button
                        onClick={(e)=>{
                            console.log(space.roomId)
                            e.stopPropagation();
                            toggleModel();
                        }}
                    >
                        <Pencil className="space_card_opt" size={16} /> <span>Edit</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteSpace(space.roomId);
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
                        onAction={() => editSpace(space.roomId, spaceName, toggleModel)}
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
