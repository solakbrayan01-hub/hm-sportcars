import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './animations.css'
import ComingSoon from './ComingSoon.jsx'
import App from './App.jsx'

const PREVIEW_PWD = "sportcars2025!";

function Root() {
  const [showSite, setShowSite] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("preview_ok") === "1") { setShowSite(true); return; }
    if (window.location.pathname.includes("admin")) {
      const pwd = window.prompt("Password:");
      if (pwd === PREVIEW_PWD) { sessionStorage.setItem("preview_ok", "1"); setShowSite(true); }
      else { window.location.href = "/"; }
    }
  }, []);
  if (showSite) return <App />;
  return <ComingSoon />;
}

createRoot(document.getElementById('root')).render(<StrictMode><Root /></StrictMode>)
