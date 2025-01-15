import React, { useState } from "react";
import { Copy, EllipsisVertical, Link, Pencil, Trash } from "lucide-react";
import { SpaceCardProps } from "../types/StateTypes";
import { useMyContext } from "../context/Context";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
            setRoomId(space.spaceid);
            navigate(`/space/${space.spaceid}`);
        }}>
            <div
                className="space_card_image"
                style={{ backgroundImage: `url(${space.spaceimage})` }}
            ></div>
            <div className="space_card_title">
                <span>{space.spacename}</span>
                {
                    space.linked === false ? (
                        <>
                            <EllipsisVertical stroke="#000" className="ellipsis icon hover" />
                            <div className="space_card_options" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleModel();
                                    }}
                                >
                                    <Pencil className="space_card_opt" size={16} /> <span>Edit</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSpace(space.spaceid);
                                    }}>
                                    <Trash className="space_card_opt" size={16} /> <span>Delete</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.navigator.clipboard.writeText(space.spaceid);
                                        toast.success("Space ID copied to clipboard.");
                                    }}>
                                    <Copy className="space_card_opt" size={16} /> <span>Copy</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link stroke="#000" className="linked icon hover"
                            onClick={(e) => {
                                e.stopPropagation();
                            }} />
                    )
                }
            </div>
            {
                modalOpen && (
                    <Modal
                        title="Edit Space"
                        actionText="Change"
                        onClose={toggleModel}
                        onAction={() => editSpace(space.spaceid, spaceName, toggleModel)}
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
