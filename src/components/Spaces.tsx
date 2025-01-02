import { useEffect } from "react";
import Navbar from "./Navbar";
import { useMyContext } from "../context/Context";
import { useNavigate } from "react-router-dom";
import SpaceCard from "./SpaceCard";
import { SpaceProps } from "../types/StateTypes";

function Spaces() {
    const { userId } = useMyContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (userId === '') {
            // navigate('/login');
        }
    }, []);

    const space: SpaceProps = {
        name: "Zeru Office",
        image: 'https://officeimage.nl/wp-content/uploads/2016/12/bureau200x100cm.jpg',
        id: '1'
    }
    return (
        <div className="spaces">
            <Navbar />
            <div className="spaces_container">
                <SpaceCard space={space} />
            </div>
        </div>
    )
}

export default Spaces;