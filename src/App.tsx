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
          if (res.data.message === "YES") {
            console.log(res.data);
            setUserId(res.data.userId);
            navigate("/spaces");
          }
        }).catch(console.log);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  return (
    <div className='main'>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/space/123" element={<Space />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  )
}

export default App
