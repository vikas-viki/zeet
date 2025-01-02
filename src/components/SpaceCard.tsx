import React from "react";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { SpaceCardProps } from "../types/StateTypes";

const SpaceCard: React.FC<SpaceCardProps> = ({ space }) => {
    return (
        <div className="space_card">
            <div
                className="space_card_image"
                style={{ backgroundImage: `url(${space.image})` }}
            ></div>
            <div className="space_card_title">
                <span>{space.name}</span>
                <EllipsisVertical stroke="#000" className="ellipsis icon" />
                <div className="space_card_options">
                    <button>
                        <Pencil className="space_card_opt" size={16}/> <span>Edit</span>
                    </button>
                    <button>
                        <Trash className="space_card_opt"  size={16}/> <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpaceCard;
