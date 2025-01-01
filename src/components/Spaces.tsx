import { useEffect } from "react";
import Navbar from "./Navbar";
import { useMyContext } from "../context/Context";
import { useNavigate } from "react-router-dom";

function Spaces() {
    const { userId } = useMyContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (userId === '') {
            navigate('/login');
        }
    }, []);
    return (
        <div className="spaces">
            <Navbar />
            <div className="">
                {/* Spaces */}
            </div>
        </div>
    )
}

export default Spaces;