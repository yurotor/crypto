import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './themes/standard.css'
import './themes/retro.css'
import './themes/futuristic.css'
import './themes/vaporwave.css'
import './themes/paper.css'
import './themes/hacker.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
