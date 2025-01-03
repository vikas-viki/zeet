import { useEffect } from "react";
import Navbar from "./Navbar";
import { useMyContext } from "../context/Context";
import { useNavigate } from "react-router-dom";
import SpaceCard from "./SpaceCard";

function Spaces() {
    const { userId, getUserSpaces, userSpaces } = useMyContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (userId === '') {
            navigate('/login');
        } else {
            getUserSpaces();
        }
    }, []);

    return (
        <div className="spaces">
            <Navbar />
            <div className="spaces_container">
                {userSpaces.length > 0 ? (
                    userSpaces.map((_space: any, i) => (
                        <SpaceCard key={i} space={_space} />
                    ))
                ) : (
                    <span>No Space Found</span>
                )}
            </div>
        </div>
    )
}

export default Spaces;