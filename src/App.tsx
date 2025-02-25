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
import { useAppContext } from "./context/Contexts";
import Profile from "./pages/Profile";
import { SERVER_URL } from "./context/AppState";

function App() {
  const { setUserId, userId, setUserName } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (userId === "") {
        axios.post(`${SERVER_URL}/auth/youknowme`, {}, { withCredentials: true }).then(res => {
          console.log(res.data);
          if (res.data.message === "YES") {
            window.localStorage.setItem("userId", res.data.userId);
            window.localStorage.setItem("userName", res.data.userName);
            setUserId(res.data.userId);
            setUserName(res.data.userName);
            if (window.location.pathname === "/login") {
              navigate("/spaces");
            } else {
              navigate(window.location.pathname);
            }
          } else if (res.data.message === "NO" && window.location.pathname !== "/") {
            navigate("/login");
          }
        }).catch((e) => {
          navigate("/");
          console.log("error", e);
        });
      }
    } catch (e) {
      console.log("error ", e);
    }
  }, [userId]);

  return (
    <div className={`main`}>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/space/:id" element={<Space />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App
