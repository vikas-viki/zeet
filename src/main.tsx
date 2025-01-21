import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppState from './context/AppState.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import SocketState from './context/SocketState.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter >
      <AppState>
        <SocketState>

        <App />
        <Toaster position='top-right' />
        </SocketState>
      </AppState>
    </BrowserRouter>
  </StrictMode>,
)
