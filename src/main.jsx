import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'

const Main = () => {
  const [showLanding, setShowLanding] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return !params.has('id')
  })

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="35" fill="#4f46e5" />
        <svg x="22" y="22" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </svg>
    `.trim();
    
    link.href = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    document.head.appendChild(link);
  }, []);

  return showLanding ? <LandingPage onEnter={() => setShowLanding(false)} /> : <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)
