import { useNavigate } from "react-router-dom";

function Hero() {
    const navigate = useNavigate();

    return (
        <div className="hero">
            <div className="hero_text">
                <span>Zeet, <br />Connecting Like<br />Never Before.</span>
                <button className="button"
                    onClick={() => { navigate("/login") }}
                >Take me in</button>
            </div>
            <div className="hero_image">
                <img src="./hero.png" alt="Hero" />
            </div>
        </div>
    )
}
export default Hero;

// background is metaverse app