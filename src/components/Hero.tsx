import { Check, Github, Layers, Linkedin, Mail, Network, Sun,Twitter } from "lucide-react";
import "../index.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Hero() {
    const navigate = useNavigate();

    const [light, setLight] = useState(true);

    const featureTitleClasses = `text-xl font-semibold ${light ? "text-black" : "text-white "} mb-4`;
    const featureContainerClass = `${light ? "bg-gray-50/50" : "bg-transparent text-white"} border-[0.5px] p-8 rounded-2xl hover:shadow-lg relative  transition-shadow`;
    const pricingCardBg = `${light ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-gray-700 text-white hover:bg-gray-600"} `;
    const footerClasses = `${light ? "text-gray-600 hover:text-black hover:bg-gray-200" : "text-gray-300 hover:text-black hover:bg-gray-200"} rounded-sm transition-all duration-300 p-2 flex items-center`;

    return (
        <div className={`h-full bg-white w-[100vw] overflow-x-hidden font-['Nunito Sans'] transition-color duration-200`}
            style={{
                backgroundImage:
                    light ?
                        `linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
                        radial-gradient(circle 500px at 20% 20%, rgba(139,92,246,0.3), transparent),
                        radial-gradient(circle 500px at 80% 80%, rgba(59,130,246,0.3), transparent)`
                        : `linear-gradient(to right, rgba(31, 41, 55, 0.4) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(31, 41, 55, 0.4) 1px, transparent 1px),
                            radial-gradient(circle 500px at 20% 20%, rgba(139, 92, 246, 0.2), transparent), 
                            radial-gradient(circle 500px at 80% 80%, rgba(59, 130, 246, 0.2), transparent)`
                ,
                backgroundColor: light ? "#ffffff" : "#0f172a",
                backgroundSize: `48px 48px, 48px 48px, 100% 100%, 100% 100%`,

            }}
        >
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto" >
                <div className={`text-2xl font-bold ${light ? 'text-black' : "text-white"}`}>ZEET</div>

                <div className="hidden md:flex items-center space-x-8">
                    {
                        ["about", "pricing", "contact"].map((a, i) => (
                            <a key={i} href={`#${a}`} className={`${light ? "text-gray-600" : "text-gray-400"} ${light ? "hover:text-black" : "hover:text-white"} transition-colors capitalize`}>{a}</a>
                        ))
                    }
                </div>

                <button
                    onClick={() => setLight(prev => !prev)}
                    className={`p-2 ${!light ? "text-gray-300" : "text-black"} cursor-pointer border-white  transition-all hover:text-gray-500`}>
                    <Sun />
                </button>
            </nav>

            <section className={`max-w-7xl mx-auto px-6 py-20 text-center my-20 ${light ? "text-black " : "text-white"}`}>
                <h1 className='text-5xl md:text-6xl [word-spacing:0.3rem] font-[600] mb-6 tracking-[-1.5px] font-["Plus Jakarta Sans"] leading-17'>
                    Real-time presence for virtual<br />spaces, that feel <span className=' italic text-7xl font-["DM+Serif+Display"]'>alive</span>.
                </h1>
                <button
                    onClick={() => {
                        navigate("/login");
                    }}
                    className={`${light ? "bg-black text-white hover:bg-gray-800" : "bg-white text-black font-medium hover:bg-gray-200"} cursor-pointer  px-6 py-3 mt-6 rounded-full text-lg  transition-colors`}>
                    Get Started
                </button>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-20" id="about">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className={featureContainerClass}>
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                            <Network className="w-6 h-6 text-white" />
                        </div>
                        <h3 className={featureTitleClasses}>Low-latency communication.</h3>
                        <p className={`${light ? "text-gray-600" : "text-gray-400"}`}>
                            Powered by MediaSoup for real-time audio and video, ensuring collaboration feels
                            as natural as being in person.
                        </p>
                    </div>

                    <div className={featureContainerClass}>
                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <h3 className={featureTitleClasses}>Instant chat.</h3>
                        <p className={`${light ? "text-gray-600" : "text-gray-400"}`}>
                            Seamless WebSocket messaging lets your whole team stay instantly connected,
                            keeping conversations flowing naturally.
                        </p>
                    </div>

                    <div className={featureContainerClass}>
                        <div
                            className="w-14 h-14 bg-black flex items-center justify-center relative mb-6"
                            style={{
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                            }}
                        >
                            <Layers className="w-6 h-6 text-white" />
                        </div>

                        <h3 className={featureTitleClasses}>Scalable infrastructure.</h3>
                        <p className={`${light ? "text-gray-600" : "text-gray-400"}`}>
                            Node.js backend on AWS with PostgreSQL for robust, global availability
                            that grows with your team.
                        </p>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-20" id="pricing">
                <div className="text-center mb-16">
                    <h2 className={`${light ? "text-black" : "text-white"} text-4xl font-bold  mb-2`}>Pricing</h2>
                    <p className="text-xl text-gray-600">Simple and flexible plans.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {[
                        {
                            name: "Free",
                            price: "$0",
                            features: ["For hobby projects", "Testing and dev use", "Basic chat & video"],
                            button: {
                                text: "Start for free",
                                bg: pricingCardBg
                            },
                        },

                        {
                            name: "Premium",
                            price: "$29",
                            features: ["For growing teams", "All core features", "Higher usage limits"],
                            border: true,
                            button: {
                                text: "Get started",
                                bg: pricingCardBg
                            },
                        },
                        {
                            name: "Pro",
                            price: "$99",
                            features: ["Most popular", "Production SLAs", "Scales with your team"],
                            button: {
                                text: "Get started",
                                bg: pricingCardBg
                            },
                        },
                    ].map(({ name, price, features, border, button }, idx) => (
                        <div
                            key={idx}
                            className={`${light ? "bg-white" : "bg-gray-50/10"} dark:bg-slate-800 shadow-sm p-8 rounded-2xl ${light && border ? "border-2 border-black" : " border-white"}`}
                        >
                            <div className={`mb-8 ${light ? "text-black" : "text-gray-500"}`}>
                                <h3 className={`text-lg font-semibold mb-2 `}>{name}</h3>
                                <div className={`text-3xl font-bold mb-4 ${light ? "text-black" : "text-white"}`}>
                                    {price}
                                    <span className={`text-lg font-normal ${light ? "text-gray-600" : "text-gray-300"}`}>/mo</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {features.map((f) => (
                                    <li key={f} className="flex items-center">
                                        <Check className="w-5 h-5 text-green-500 mr-3" />
                                        <span className={`${light ? "text-gray-600" : "text-gray-300"}`}>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => {
                                    navigate("/login");
                                }}
                                className={`w-full py-3 rounded-full font-medium transition-colors ${button.bg}`}>{button.text}</button>
                        </div>
                    ))}
                </div>
            </section>

            <footer className={``} id="contact">
                <div className="max-w-7xl mx-auto px-6 py-6 ">
                    <div className="flex justify-between gap-8 items-center">
                        <div className="flex justify-center items-center gap-2">
                            <div className={`text-2xl font-bold ${light ? "text-black" : "text-white"} mb-2`}>ZEET</div>
                            <span className={`${light ? "text-black" : "text-gray-200"}`}>Realtime virtual collaboration made possible!</span>
                        </div>

                        <div>
                            <ul className="flex gap-8">
                                <li><a href="#" className={footerClasses}>
                                    <Github className="w-4 h-4 mr-2" />
                                    GitHub
                                </a></li>
                                <li><a href="#" className={footerClasses}>
                                    <Twitter className="w-4 h-4 mr-2" />
                                    Twitter
                                </a></li>
                                <li><a href="#" className={footerClasses}>
                                    <Linkedin className="w-4 h-4 mr-2" />
                                    LinkedIn
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    )
}

export default Hero;
