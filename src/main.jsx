import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SharePage from './SharePage.jsx'

const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)$/)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {shareMatch ? <SharePage shareId={shareMatch[1]} /> : <App />}
  </StrictMode>,
)
