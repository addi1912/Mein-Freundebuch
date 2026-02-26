import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCIWTav_h1lkWFg_NFcFhnJ-qLfJBeEmHE",
  authDomain: "mein-freundebuch.firebaseapp.com",
  projectId: "mein-freundebuch",
  storageBucket: "mein-freundebuch.firebasestorage.app",
  messagingSenderId: "1040024985833",
  appId: "1:1040024985833:web:a62aa9b2870fb4a1ba1078",
  measurementId: "G-3ZSNF9HEHB"
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Init Error", e);
}

const Main = () => {
  const [showLanding, setShowLanding] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return !params.has('id')
  })
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleGoogleLogin = async () => {
    if (!auth) {
      console.error("Firebase nicht initialisiert");
      return;
    }
    
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowLoginModal(false);
      setShowLanding(false);
    } catch (error) {
      console.error("Login abgebrochen oder fehlgeschlagen", error);
    }
  };

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

    // PWA Manifest einbinden
    const manifestLink = document.querySelector("link[rel='manifest']") || document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);

    // Service Worker für PWA Support registrieren
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Fehler', err));
    }
  }, []);

  return (
    <>
      {showLanding ? (
        <LandingPage onEnter={() => setShowLoginModal(true)} />
      ) : (
        <App auth={auth} db={db} isConfigured={!!auth} onLoginRequest={() => setShowLoginModal(true)} />
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative border border-slate-100">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-5 right-5 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div className="text-center mb-8 mt-2">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Anmelden</h2>
              <p className="text-sm font-bold text-slate-400">Wähle deine Methode</p>
            </div>

            <div className="space-y-3">
              <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 text-slate-700 font-bold py-4 rounded-2xl transition-all active:scale-95 group relative overflow-hidden">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="relative z-10">Weiter mit Google</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)