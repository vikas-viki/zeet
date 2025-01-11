import { useEffect } from "react";
import Navbar from "./Navbar";
import { useMyContext } from "../context/Context";
import { useNavigate } from "react-router-dom";
import SpaceCard from "./SpaceCard";
import { SpaceProps } from "../types/StateTypes";

function Spaces() {
    const { userId, getUserSpaces, userSpaces } = useMyContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (userId !== '') {
            console.log("Getting user spaces");
            getUserSpaces();
        }
    }, [userId]);

    return (
        <div className="spaces">
            <Navbar />
            <div className="spaces_container">
                {userSpaces.length > 0 ? (
                    userSpaces.map((_space: SpaceProps) => (
                        <SpaceCard key={_space.spaceid} space={_space} />
                    ))
                ) : (
                    <span>No Space Found</span>
                )}
            </div>
        </div>
    )
}

export default Spaces;