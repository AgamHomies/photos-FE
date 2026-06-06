import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { AuthProvider } from './context/AuthContext';

// When a new deployment replaces the old one, JS bundle filenames change.
// If the browser has a stale index.html cached, it references old chunk hashes
// that no longer exist — the server returns an HTML 404 page instead of JS,
// causing "Unexpected token '<'" errors.
//
// Primary fix: server.js sends Cache-Control: no-cache on index.html so the
// browser always fetches the latest manifest.
//
// Fallback: if a script/link load fails anyway (e.g. mid-flight request during
// deployment), force a hard reload by adding a cache-busting query param.
// Using window.location.replace (not reload()) so the browser can't serve
// a cached copy of index.html even if headers were somehow ignored.
window.addEventListener('error', (event) => {
  const target = event.target as HTMLElement;
  if (target instanceof HTMLScriptElement || target instanceof HTMLLinkElement) {
    const reloaded = sessionStorage.getItem('chunk_reload');
    if (!reloaded) {
      sessionStorage.setItem('chunk_reload', '1');
      // Hard-reload: navigate to the same path with a timestamp param
      // so the browser is forced to fetch a fresh index.html from the server.
      const url = new URL(window.location.href);
      url.searchParams.set('_r', String(Date.now()));
      window.location.replace(url.toString());
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