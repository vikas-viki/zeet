import React from "react";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { SpaceCardProps } from "../types/StateTypes";
import { useMyContext } from "../context/Context";

const SpaceCard: React.FC<SpaceCardProps> = ({ space }) => {

    const { deleteSpace } = useMyContext();

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
                    <button>
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
        </div>
    );
};

export default SpaceCard;
