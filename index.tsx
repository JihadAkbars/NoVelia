import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Debug logging
console.log("[NoVelia] Initializing...");
console.log("[NoVelia] React Version:", React.version);

const mountApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("[NoVelia] Error: Root element '#root' not found.");
    return;
  }

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
    console.log("[NoVelia] App mounted successfully.");
  } catch (err: any) {
    console.error("[NoVelia] Mounting failed:", err);
    
    // Fallback UI if React fails to even start rendering
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; text-align: center; background: #fff5f5; color: #c53030; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <h2 style="font-weight: bold; font-size: 20px;">Startup Error</h2>
        <p style="margin-top: 10px;">${err.message || 'Check browser console for details.'}</p>
        <button onclick="location.reload(true)" style="margin-top: 20px; padding: 10px 20px; background: #c53030; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
      </div>
    `;
  }
};

// Ensure DOM is ready before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
