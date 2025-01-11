import {
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import './App.css';
import Hero from './components/Hero';
import Spaces from "./components/Spaces";
import Space from "./components/Space";
import Login from "./components/Login";
import { useEffect } from "react";
import axios from "axios";
import { useMyContext } from "./context/Context";

function App() {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  const { setUserId, userId } = useMyContext();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (userId === "") {
        axios.post(`${SERVER_URL}/youknowme`, {}, { withCredentials: true }).then(res => {
          console.log(res.data);
          if (res.data.message === "YES") {
            setUserId(res.data.userId);
            if (window.location.pathname === "/" || window.location.pathname === "/login") {
              navigate("/spaces");
            } else {
              navigate(window.location.pathname);
            }
          } else if (res.data.message === "NO") {
            navigate("/login");
          }
        }).catch((e)=>{
          navigate("/login");
          console.log("error", e);
        });
      }
    } catch (e) {
      console.log("error ", e);
    }
  }, [userId]);

  return (
    <div className={`main ${window.location.pathname.split("/").length <= 2 && "main_padding"}`}>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/space/:id" element={<Space />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  )
}

export default App
