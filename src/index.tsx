import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { AuthProvider } from './context/AuthContext';

// When a new deployment replaces the old one, JS bundle filenames change.
// If the user's browser has the old index.html cached (e.g. mid-OAuth flow),
// it will try to load old chunk hashes that no longer exist and get back an
// HTML 404 — causing "Unexpected token '<'" errors.
// This listener detects script-load failures and does a clean hard-reload once.
window.addEventListener('error', (event) => {
  const target = event.target as HTMLElement;
  if (target instanceof HTMLScriptElement || target instanceof HTMLLinkElement) {
    const reloaded = sessionStorage.getItem('chunk_reload');
    if (!reloaded) {
      sessionStorage.setItem('chunk_reload', '1');
      window.location.reload();
    }
  }
}, true /* capture phase — fires before React */);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);