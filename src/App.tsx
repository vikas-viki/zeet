import {
  Route,
  Routes,
} from "react-router-dom";
import './App.css';
import Hero from './components/Hero';
import Spaces from "./components/Spaces";
import Space from "./components/Space";

function App() {

  return (
    <div className='main'>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/space/123" element={<Space />} />
      </Routes>
    </div>
  )
}

export default App
