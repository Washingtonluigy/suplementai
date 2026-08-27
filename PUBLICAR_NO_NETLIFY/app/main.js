import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';

createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
window.__SA_BUILD__ = 'SA-20260827-MT-SITE-PDV-01';
if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {}); }
