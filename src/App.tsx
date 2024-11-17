import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import './App.css';
import Hero from './components/Hero';
import Spaces from "./components/Spaces";

function App() {

  return (
    <div className='main'>
      <BrowserRouter >
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/spaces" element={<Spaces />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
