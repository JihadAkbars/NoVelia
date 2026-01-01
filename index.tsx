import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Debug logging
console.log("[NoVelia] Initializing...");
console.log("[NoVelia] React Version:", React.version);

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ThemeProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </ThemeProvider>
      </React.StrictMode>
    );
    console.log("[NoVelia] App mounted.");
  } catch (err: any) {
    console.error("[NoVelia] Mount Error:", err);
    rootElement.innerHTML = `<div style="padding: 2rem; color: #b91c1c; font-family: sans-serif;">
      <h1 style="font-size: 1.25rem; font-weight: bold;">Failed to Load App</h1>
      <p style="margin-top: 0.5rem;">${err.message || 'Check console for details.'}</p>
    </div>`;
  }
} else {
  console.error("[NoVelia] Error: Root element '#root' not found.");
}
