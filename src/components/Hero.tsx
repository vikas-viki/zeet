import { ArrowRight, Circle, Globe2, MessageSquare, Users, Video, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Hero() {
    const navigate = useNavigate();

    return (
        <div className="hero">
            <div className="hero_section_1">
                <span>Zeet</span>
            </div>
            <div className="hero_section_2">
                <div className="hero_section_2_text">
                    <span className="main_text">
                        Virtual Spaces for Meaningful Connections
                    </span>
                    <span className="sub_text">
                        Create immersive virtual spaces where teams can meet, collaborate, and interact naturally - just like in real life.
                    </span>
                    <button onClick={() => {
                        navigate("/login");
                    }}>Get started <ArrowRight size={18} /></button>
                </div>
                <div className="hero_section_2_image">
                    <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80" alt="#" />
                    <span><Circle size={18} />19 Online now</span>
                </div>
            </div>
            <div className="hero_section_3">
                <div className="hero_section_3_text">
                    <span>Everything you need for virtual collaboration
                    </span>
                </div>
                <div className="hero_section_3_features">
                    <FeatureCard
                        icon={<Video className="feature_icon" />}
                        title="Video Chat"
                        description="Crystal clear video conversations with spatial audio for natural interactions"
                    />
                    <FeatureCard
                        icon={<MessageSquare className="feature_icon" />}
                        title="Chat & Share"
                        description="Real-time messaging and space sharing to keep conversations flowing"
                    />
                    <FeatureCard
                        icon={<Users className="feature_icon" />}
                        title="Custom Spaces"
                        description="Create and customize your virtual spaces to match your team's needs"
                    />
                </div>
            </div>
            <div className="hero_section_4">
                <div className="hero_section_4_text">
                    <span>
                        Trusted by teams worldwide
                    </span>
                </div>
                <div className="hero_section_4_icons">
                    <Globe2 className="h-12 w-12" />
                    <Zap className="h-12 w-12" />
                    <Users className="h-12 w-12" />
                </div>
            </div>
        </div>
    )
}


function FeatureCard({ icon, title, description }: any) {
    return (
        <div className="feature_card">
            <div >{icon}</div>
            <h4 >{title}</h4>
            <p >{description}</p>
        </div>
    );
}

export default Hero;

// background is metaverse app