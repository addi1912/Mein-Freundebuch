import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'

const Main = () => {
  const [showLanding, setShowLanding] = useState(true)

  return showLanding ? <LandingPage onEnter={() => setShowLanding(false)} /> : <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)
